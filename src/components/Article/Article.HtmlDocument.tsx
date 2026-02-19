import styled from '@emotion/styled'
import { useEffect, useMemo, useRef, useState } from 'react'
import { LPE } from '../../types/lpe.types'

type Props = {
  doc: LPE.Post.HtmlDocument
}

const ArticleHtmlDocument = ({ doc }: Props) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const [height, setHeight] = useState<number>(640)
  const srcDoc = useMemo(() => buildSrcDoc(doc), [doc])

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (
        !iframeRef.current ||
        event.source !== iframeRef.current.contentWindow
      )
        return
      if (!event.data || event.data.type !== 'lpe-html-doc-height') return
      const next = Number(event.data.height)
      if (!Number.isFinite(next) || next <= 0) return
      setHeight(Math.max(200, Math.ceil(next)))
    }

    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  return (
    <SandboxedDocumentFrame
      ref={iframeRef}
      title={doc.title || 'Article HTML Document'}
      sandbox="allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
      scrolling="no"
      height={height}
      srcDoc={srcDoc}
    />
  )
}

function escapeAttr(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function scriptContent(value: string) {
  return value.replace(/<\/script>/gi, '<\\/script>')
}

function buildMetaTag(meta: LPE.Post.HtmlMeta) {
  const attrs = [
    meta.name ? ` name="${escapeAttr(meta.name)}"` : '',
    meta.content ? ` content="${escapeAttr(meta.content)}"` : '',
    meta.property ? ` property="${escapeAttr(meta.property)}"` : '',
    meta.charset ? ` charset="${escapeAttr(meta.charset)}"` : '',
    meta.httpEquiv ? ` http-equiv="${escapeAttr(meta.httpEquiv)}"` : '',
  ].join('')
  return `<meta${attrs}>`
}

function buildLinkTag(link: LPE.Post.HtmlLink) {
  const safeCrossOrigin =
    link.crossOrigin === '' ||
    link.crossOrigin === 'anonymous' ||
    link.crossOrigin === 'use-credentials'
      ? link.crossOrigin
      : undefined

  const attrs = [
    link.rel ? ` rel="${escapeAttr(link.rel)}"` : '',
    link.href ? ` href="${escapeAttr(link.href)}"` : '',
    link.as ? ` as="${escapeAttr(link.as)}"` : '',
    link.type ? ` type="${escapeAttr(link.type)}"` : '',
    safeCrossOrigin !== undefined
      ? ` crossorigin="${escapeAttr(safeCrossOrigin)}"`
      : '',
  ].join('')
  return `<link${attrs}>`
}

function buildScriptTag(script: LPE.Post.HtmlScript) {
  const attrs = [
    script.type ? ` type="${escapeAttr(script.type)}"` : '',
    script.async ? ' async' : '',
    script.defer ? ' defer' : '',
    script.noModule ? ' nomodule' : '',
  ].join('')

  if (script.src) {
    return `<script src="${escapeAttr(script.src)}"${attrs}></script>`
  }
  if (script.content) {
    return `<script${attrs}>${scriptContent(script.content)}</script>`
  }
  return ''
}

function buildSrcDoc(doc: LPE.Post.HtmlDocument) {
  const titleTag = doc.title
    ? `<title>${escapeAttr(doc.title)}</title>`
    : '<title>Article</title>'
  const metas = doc.metas.map((meta) => buildMetaTag(meta)).join('\n    ')
  const links = doc.links.map((link) => buildLinkTag(link)).join('\n    ')
  const styles = doc.styles
    .map((style) => `<style>${style}</style>`)
    .join('\n    ')
  const scripts = doc.scripts
    .map((script) => buildScriptTag(script))
    .filter(Boolean)
    .join('\n    ')
  const bodyClass = doc.bodyClass ? ` class="${escapeAttr(doc.bodyClass)}"` : ''

  const autoHeightScript = `<script>
    (function () {
      var disposed = false;
      var lastHeight = -1;
      var scheduled = false;
      var rafId = 0;
      var timeoutId = 0;
      var resizeObserver = null;

      function postHeight() {
        if (disposed) return;
        var h = Math.max(
          document.documentElement.scrollHeight || 0,
          document.body ? document.body.scrollHeight : 0
        );
        if (h === lastHeight) return;
        lastHeight = h;
        try {
          parent.postMessage({ type: 'lpe-html-doc-height', height: h }, '*');
        } catch (e) {}
      }

      function runScheduledPost() {
        scheduled = false;
        rafId = 0;
        timeoutId = 0;
        postHeight();
      }

      function schedulePost() {
        if (disposed || scheduled) return;
        scheduled = true;
        if (typeof window.requestAnimationFrame === 'function') {
          rafId = window.requestAnimationFrame(runScheduledPost);
          return;
        }
        timeoutId = window.setTimeout(runScheduledPost, 16);
      }

      function onResize() {
        schedulePost();
      }

      function onLoad() {
        schedulePost();
      }

      if (document.readyState === 'complete' || document.readyState === 'interactive') {
        schedulePost();
      } else {
        window.addEventListener('load', onLoad);
      }

      window.addEventListener('resize', onResize);
      var observer = new MutationObserver(function () { schedulePost(); });
      observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, characterData: true });

      if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(function () {
          schedulePost();
        });
        resizeObserver.observe(document.documentElement);
        if (document.body) resizeObserver.observe(document.body);
      }

      if (document.fonts && document.fonts.ready && typeof document.fonts.ready.then === 'function') {
        document.fonts.ready.then(function () { schedulePost(); }).catch(function () {});
      }

      window.setTimeout(schedulePost, 120);
      window.setTimeout(schedulePost, 600);

      window.addEventListener('unload', function () {
        disposed = true;
        observer.disconnect();
        if (resizeObserver) resizeObserver.disconnect();
        window.removeEventListener('resize', onResize);
        window.removeEventListener('load', onLoad);
        if (rafId) window.cancelAnimationFrame(rafId);
        if (timeoutId) window.clearTimeout(timeoutId);
      });
    })();
  </script>`

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    ${titleTag}
    ${metas}
    ${links}
    <style>
      html, body { margin: 0; padding: 0; overflow-x: hidden; }
    </style>
    ${styles}
  </head>
  <body${bodyClass}>
    ${doc.bodyHtml}
    ${scripts}
    ${autoHeightScript}
  </body>
</html>`
}

const SandboxedDocumentFrame = styled.iframe<{ height: number }>`
  width: 100%;
  border: 0;
  display: block;
  height: ${(props) => props.height}px;
`

export default ArticleHtmlDocument
