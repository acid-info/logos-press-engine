import type { NextApiRequest, NextApiResponse } from 'next'

// Lightweight memory diagnostics endpoint used for A/B testing memory leak
// fixes. Returns raw process.memoryUsage() values plus human-readable MB
// equivalents so the caller doesn't have to do the arithmetic.
//
// In production this should be protected behind a secret token or removed
// entirely. For the A/B test it only needs to be reachable inside the
// Docker network.
export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  const m = process.memoryUsage()
  const mb = (bytes: number) => parseFloat((bytes / 1024 / 1024).toFixed(2))

  res.status(200).json({
    uptimeSeconds: Math.floor(process.uptime()),
    // Raw bytes — useful for graphing / CSV output
    rss: m.rss,
    heapTotal: m.heapTotal,
    heapUsed: m.heapUsed,
    external: m.external,
    arrayBuffers: m.arrayBuffers,
    // Human-readable MB — useful for quick eyeballing
    rss_mb: mb(m.rss),
    heapTotal_mb: mb(m.heapTotal),
    heapUsed_mb: mb(m.heapUsed),
    external_mb: mb(m.external),
    arrayBuffers_mb: mb(m.arrayBuffers),
  })
}
