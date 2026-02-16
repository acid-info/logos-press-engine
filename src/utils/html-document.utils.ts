import { parse } from 'node-html-parser'
import { LPE } from '../types/lpe.types'

const cleanObject = (value: any): any => {
  if (Array.isArray(value)) {
    return value.map(cleanObject)
  }
  if (value && typeof value === 'object') {
    const cleaned: any = {}
    for (const [key, val] of Object.entries(value)) {
      if (val === undefined) continue
      const next = cleanObject(val)
      if (next === undefined) continue
      cleaned[key] = next
    }
    return cleaned
  }
  return value
}

const getAttr = (el: any, name: string): string | undefined => {
  if (!el) return undefined
  const value = el.getAttribute?.(name)
  return value || undefined
}

export const parseHtmlDocument = (html: string): LPE.Post.HtmlDocument => {
  const root = parse(html, { comment: true })
  const head = root.querySelector('head')
  const body = root.querySelector('body')
  const headOrRoot = head || root

  const title =
    head?.querySelector('title')?.text ||
    (!head ? root.querySelector('title')?.text : undefined) ||
    undefined

  const metas =
    headOrRoot.querySelectorAll('meta').map((meta) => ({
      name: getAttr(meta, 'name'),
      content: getAttr(meta, 'content'),
      property: getAttr(meta, 'property'),
      charset: getAttr(meta, 'charset'),
      httpEquiv: getAttr(meta, 'http-equiv'),
    })) || []

  const links =
    headOrRoot.querySelectorAll('link').map((link) => ({
      rel: getAttr(link, 'rel'),
      href: getAttr(link, 'href'),
      as: getAttr(link, 'as'),
      type: getAttr(link, 'type'),
      crossOrigin: getAttr(link, 'crossorigin'),
    })) || []

  // Accept both full HTML documents and fragments that place style tags at top-level.
  const styles = root.querySelectorAll('style').map((s) => s.innerHTML) || []

  const scripts = root.querySelectorAll('script').map((script) => ({
    src: getAttr(script, 'src'),
    content: script.innerHTML || undefined,
    type: getAttr(script, 'type'),
    async: script.hasAttribute?.('async') || undefined,
    defer: script.hasAttribute?.('defer') || undefined,
    noModule: script.hasAttribute?.('nomodule') || undefined,
  }))

  if (body) {
    body.querySelectorAll('script').forEach((script) => script.remove())
    body.querySelectorAll('style').forEach((style) => style.remove())
  } else {
    root.querySelectorAll('script').forEach((script) => script.remove())
    root.querySelectorAll('style').forEach((style) => style.remove())
    root.querySelectorAll('meta').forEach((meta) => meta.remove())
    root.querySelectorAll('link').forEach((link) => link.remove())
    root.querySelectorAll('title').forEach((titleTag) => titleTag.remove())
    root.querySelectorAll('head').forEach((headTag) => headTag.remove())
  }

  const bodyHtml = body ? body.innerHTML : root.innerHTML
  const bodyClass = getAttr(body, 'class')

  const doc = {
    title,
    metas,
    links,
    styles,
    scripts,
    bodyHtml,
    bodyClass,
  }

  return cleanObject(doc) as LPE.Post.HtmlDocument
}
