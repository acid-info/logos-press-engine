import katex from 'katex'

type Segment =
  | { kind: 'text'; value: string }
  | { kind: 'math'; value: string; displayMode: boolean }

const splitMath = (input: string): Segment[] => {
  const out: Segment[] = []
  let i = 0

  const pushText = (value: string) => {
    if (value) out.push({ kind: 'text', value })
  }

  while (i < input.length) {
    const nextDisplay = input.indexOf('$$', i)
    const nextInline = input.indexOf('\\(', i)

    const next =
      nextDisplay === -1
        ? nextInline
        : nextInline === -1
        ? nextDisplay
        : Math.min(nextDisplay, nextInline)

    if (next === -1) {
      pushText(input.slice(i))
      break
    }

    pushText(input.slice(i, next))

    if (next === nextDisplay) {
      const end = input.indexOf('$$', next + 2)
      if (end === -1) {
        pushText(input.slice(next))
        break
      }
      out.push({
        kind: 'math',
        value: input.slice(next + 2, end).trim(),
        displayMode: true,
      })
      i = end + 2
      continue
    }

    const end = input.indexOf('\\)', next + 2)
    if (end === -1) {
      pushText(input.slice(next))
      break
    }
    out.push({
      kind: 'math',
      value: input.slice(next + 2, end).trim(),
      displayMode: false,
    })
    i = end + 2
  }

  return out
}

export const renderLatexInHtml = (html: string) => {
  if (!html) return html
  if (!html.includes('$$') && !html.includes('\\(')) return html
  if (
    html.includes('<code') ||
    html.includes('<pre') ||
    html.includes('<script')
  )
    return html

  const segments = splitMath(html)
  if (segments.length === 1 && segments[0]?.kind === 'text') return html

  return segments
    .map((seg) => {
      if (seg.kind === 'text') return seg.value
      return katex.renderToString(seg.value, {
        displayMode: seg.displayMode,
        throwOnError: false,
        strict: 'ignore',
        trust: false,
        output: 'html',
      })
    })
    .join('')
}
