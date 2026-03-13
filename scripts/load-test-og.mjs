#!/usr/bin/env node
/**
 * OG image load tester — A/B memory leak validation
 *
 * Hammers /api/og on both containers simultaneously with a realistic mix of
 * requests that mirror what search-engine and social-media bots send (varied
 * article titles, images, authors, dates). This is the exact traffic pattern
 * that caused the memory leak in production.
 *
 * Usage:
 *   node scripts/load-test-og.mjs [--duration=300] [--concurrency=20]
 *
 * Options:
 *   --duration      Test duration in seconds (default: 300 = 5 min)
 *   --concurrency   Parallel in-flight requests per target (default: 20)
 *   --master-port   Port for the master (unfixed) container (default: 3001)
 *   --fix-port      Port for the fix container (default: 3002)
 *
 * No external dependencies — pure Node.js built-ins only.
 */

import http from 'node:http'

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=')
    return [k, v ?? true]
  }),
)

const DURATION_S = parseInt(args['duration'] ?? '300', 10)
const CONCURRENCY = parseInt(args['concurrency'] ?? '20', 10)
const MASTER_PORT = parseInt(args['master-port'] ?? '3001', 10)
const FIX_PORT = parseInt(args['fix-port'] ?? '3002', 10)

// ---------------------------------------------------------------------------
// Realistic OG request corpus
// Simulates bots crawling article/podcast pages with varied query params.
// Each entry becomes a unique ?q= payload just as the browser/crawler sends.
// ---------------------------------------------------------------------------
const SAMPLE_ARTICLES = [
  {
    title: 'Logos: The Architecture of Freedom',
    contentType: 'article',
    authors: 'Alice Turing',
    date: '2024-01-15',
  },
  {
    title: 'Decentralised Finance and the State',
    contentType: 'article',
    authors: 'Bob Nakamoto',
    date: '2024-02-20',
  },
  {
    title: 'The Philosophy of Open Source',
    contentType: 'article',
    authors: 'Carol Diffie',
    date: '2024-03-10',
  },
  {
    title: 'Zero-Knowledge Proofs Explained',
    contentType: 'article',
    authors: 'Dave Merkle',
    date: '2024-04-05',
  },
  {
    title: 'Privacy as a Human Right',
    contentType: 'article',
    authors: 'Eve Shannon',
    date: '2024-05-18',
  },
  {
    title: 'Web3 and the New Commons',
    contentType: 'article',
    authors: 'Frank Vigenere',
    date: '2024-06-01',
  },
  {
    title: 'Surveillance Capitalism: A Critique',
    contentType: 'article',
    authors: 'Grace Hopper',
    date: '2024-07-22',
  },
  {
    title: 'Building Sovereign Infrastructure',
    contentType: 'article',
    authors: 'Hal Finney',
    date: '2024-08-09',
  },
  {
    title: 'The Cypherpunk Manifesto Revisited',
    contentType: 'article',
    authors: 'Ivan Sutherland',
    date: '2024-09-30',
  },
  {
    title: 'Mesh Networks and Community Resilience',
    contentType: 'article',
    authors: 'Judy Lovelace',
    date: '2024-10-14',
  },
  {
    title: 'Episode 42: Trust and Cryptography',
    contentType: 'podcast',
    authors: '',
    date: '2024-01-08',
  },
  {
    title: 'Episode 43: The Digital Commons',
    contentType: 'podcast',
    authors: '',
    date: '2024-02-12',
  },
  {
    title: 'Episode 44: Self-Sovereign Identity',
    contentType: 'podcast',
    authors: '',
    date: '2024-03-03',
  },
  // Deliberately malformed / edge-case inputs that can trigger WASM panics
  { title: '', contentType: 'article', authors: '', date: '' },
  {
    title: 'A'.repeat(200),
    contentType: 'article',
    authors: 'X',
    date: '2024-01-01',
  },
  {
    title: '<script>alert(1)</script>',
    contentType: 'article',
    authors: '',
    date: '',
  },
  {
    title: '日本語タイトル',
    contentType: 'article',
    authors: 'テスト著者',
    date: '2024-11-11',
  },
  {
    title: 'Ünïcödé Héàdings',
    contentType: 'article',
    authors: 'Ö. Åström',
    date: '2024-12-25',
  },
]

/**
 * Build the ?q= query param the same way the front-end does it.
 */
function buildOgUrl(port, article) {
  const inner = new URLSearchParams({
    contentType: article.contentType,
    title: article.title,
    authors: article.authors,
    date: article.date,
    pagePath: '/article/test-slug',
    image: '',
    alt: '',
  }).toString()

  const q = encodeURIComponent(inner)
  return `http://127.0.0.1:${port}/api/og?q=${q}`
}

// ---------------------------------------------------------------------------
// Minimal HTTP GET helper (no axios, no node-fetch)
// ---------------------------------------------------------------------------
function get(url) {
  return new Promise((resolve) => {
    const req = http.get(url, { timeout: 15_000 }, (res) => {
      res.resume() // drain body
      res.on('end', () =>
        resolve({ ok: res.statusCode < 400, status: res.statusCode }),
      )
    })
    req.on('error', () => resolve({ ok: false, status: 0 }))
    req.on('timeout', () => {
      req.destroy()
      resolve({ ok: false, status: 0 })
    })
  })
}

// ---------------------------------------------------------------------------
// Worker pool — keeps CONCURRENCY requests in flight at all times
// ---------------------------------------------------------------------------
async function runWorker(port, label, stats, deadline) {
  let idx = 0
  while (Date.now() < deadline) {
    const article = SAMPLE_ARTICLES[idx % SAMPLE_ARTICLES.length]
    idx++
    const url = buildOgUrl(port, article)
    const { ok, status } = await get(url)
    stats.total++
    if (ok) stats.ok++
    else {
      stats.err++
      stats.lastErrStatus = status
    }
  }
}

// ---------------------------------------------------------------------------
// Stats printer
// ---------------------------------------------------------------------------
function printStats(elapsed, masterStats, fixStats) {
  const fmt = (s) =>
    `total=${s.total.toString().padStart(5)}  ok=${s.ok
      .toString()
      .padStart(5)}  err=${s.err.toString().padStart(4)}  rps=${(
      s.total / elapsed
    )
      .toFixed(1)
      .padStart(6)}`
  console.log(
    `[${elapsed.toString().padStart(4)}s]  MASTER: ${fmt(
      masterStats,
    )}  |  FIX: ${fmt(fixStats)}`,
  )
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log(`
OG image load tester
  Duration:    ${DURATION_S}s
  Concurrency: ${CONCURRENCY} workers per target
  Master port: ${MASTER_PORT}
  Fix port:    ${FIX_PORT}
  Corpus:      ${SAMPLE_ARTICLES.length} unique request variants
`)

  // Verify both containers are up before starting
  for (const [port, name] of [
    [MASTER_PORT, 'master'],
    [FIX_PORT, 'fix'],
  ]) {
    const { ok } = await get(`http://127.0.0.1:${port}/api/health`)
    if (!ok) {
      console.error(
        `ERROR: ${name} container on port ${port} is not responding to /api/health`,
      )
      console.error(
        'Start both containers first:  docker compose -f docker-compose.ab-test.yml up -d',
      )
      process.exit(1)
    }
  }
  console.log('Both containers healthy — starting load test...\n')

  const deadline = Date.now() + DURATION_S * 1000
  const masterStats = { total: 0, ok: 0, err: 0, lastErrStatus: 0 }
  const fixStats = { total: 0, ok: 0, err: 0, lastErrStatus: 0 }

  // Launch worker pools
  const workers = [
    ...Array.from({ length: CONCURRENCY }, () =>
      runWorker(MASTER_PORT, 'master', masterStats, deadline),
    ),
    ...Array.from({ length: CONCURRENCY }, () =>
      runWorker(FIX_PORT, 'fix', fixStats, deadline),
    ),
  ]

  // Print progress every 15 seconds
  const start = Date.now()
  const printer = setInterval(() => {
    const elapsed = Math.floor((Date.now() - start) / 1000)
    printStats(elapsed, masterStats, fixStats)
  }, 15_000)

  await Promise.all(workers)
  clearInterval(printer)

  const elapsed = Math.floor((Date.now() - start) / 1000)
  console.log('\n=== FINAL RESULTS ===')
  printStats(elapsed, masterStats, fixStats)
  console.log(
    '\nMaster errors (expect high — this is the leaking version):',
    masterStats.err,
  )
  console.log(
    'Fix errors (expect low — WASM crash guard should absorb them):',
    fixStats.err,
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
