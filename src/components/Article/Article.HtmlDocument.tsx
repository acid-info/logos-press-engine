import styled from '@emotion/styled'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useIsDarkTheme } from '../../states/themeState'
import { LPE } from '../../types/lpe.types'

type Props = {
  doc: LPE.Post.HtmlDocument
}

const ArticleHtmlDocument = ({ doc }: Props) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const [height, setHeight] = useState<number>(640)
  const isDarkTheme = useIsDarkTheme()
  const srcDoc = useMemo(
    () => buildSrcDoc(doc, isDarkTheme),
    [doc, isDarkTheme],
  )

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
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
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

function buildSrcDoc(doc: LPE.Post.HtmlDocument, isDarkTheme: boolean) {
  const titleTag = doc.title
    ? `<title>${escapeAttr(doc.title)}</title>`
    : '<title>Article</title>'
  const metas = doc.metas.map((meta) => buildMetaTag(meta)).join('\n    ')
  const links = doc.links.map((link) => buildLinkTag(link)).join('\n    ')
  const styles = doc.styles
    .map((style) => `<style>${style}</style>`)
    .join('\n    ')
  const darkModeReadabilityStyle = isDarkTheme
    ? `<style>
      :root,
      html,
      body,
      body[class],
      body :where([class*="s0-"], [style*="--s0-bg-surface"]) {
        --s0-bg-surface: transparent !important;
        --s0-bg: transparent !important;
        --s0-text-dim: #aeb8d7 !important;
        --s0-text: #d7def2 !important;
        --s0-text-secondary: #c3cce6 !important;
        --s0-accent-text: #e09ca8 !important;
        --s0-accent: #ff8ea1 !important;
      }
      body :where(h1, h2, h3, h4, h5, h6, p, li, blockquote, figcaption) {
        color: #a7b0cf !important;
      }
      body :where(strong, b) {
        color: #c2c9e3 !important;
      }
      body :where(.s0-pull-quote, [class*="pull-quote"]) {
        color: #b6bfdc !important;
      }
      body :where(.s0-pull-quote, [class*="pull-quote"]) :where(*, strong, b, em, i, p, span) {
        color: inherit !important;
      }
      body :where(.s0-demo-header, [class*="s0-demo-header"]) {
        color: #626d8d !important;
      }
      body :where(.s0-demo-header, [class*="s0-demo-header"]) :where(*, strong, b, em, i, p, span) {
        color: inherit !important;
      }
      body :where(code, kbd, samp) {
        color: #f8f8fa !important;
      }
      body :where(code, kbd, samp) :where(*, strong, b, em, i, span) {
        color: inherit !important;
      }
    </style>`
    : ''
  const scripts = doc.scripts
    .map((script) => buildScriptTag(script))
    .filter(Boolean)
    .join('\n    ')
  const bodyClass = doc.bodyClass ? ` class="${escapeAttr(doc.bodyClass)}"` : ''

  const externalLinkScript = `<script>
    (function () {
      function isExternalHttpsLink(rawHref) {
        if (!rawHref) return false;
        try {
          var url = new URL(rawHref, window.location.href);
          return url.protocol === 'https:' && url.origin !== window.location.origin;
        } catch (e) {
          return false;
        }
      }

      function hardenLink(anchor) {
        anchor.setAttribute('target', '_blank');
        var rel = anchor.getAttribute('rel') || '';
        if (rel.indexOf('noopener') === -1) rel = (rel + ' noopener').trim();
        if (rel.indexOf('noreferrer') === -1) rel = (rel + ' noreferrer').trim();
        anchor.setAttribute('rel', rel);
      }

      function processLinks(root) {
        var links = root.querySelectorAll('a[href]');
        for (var i = 0; i < links.length; i++) {
          var anchor = links[i];
          var href = anchor.getAttribute('href') || '';
          if (!isExternalHttpsLink(href)) continue;
          hardenLink(anchor);
        }
      }

      document.addEventListener('click', function (event) {
        var target = event.target;
        if (!target || !target.closest) return;
        var anchor = target.closest('a[href]');
        if (!anchor) return;
        var href = anchor.getAttribute('href') || '';
        if (!isExternalHttpsLink(href)) return;
        hardenLink(anchor);
        event.preventDefault();
        try {
          window.open(anchor.href, '_blank', 'noopener,noreferrer');
        } catch (e) {}
      }, true);

      processLinks(document);

      var observer = new MutationObserver(function () {
        processLinks(document);
      });
      observer.observe(document.documentElement, { childList: true, subtree: true });

      window.addEventListener('unload', function () {
        observer.disconnect();
      });
    })();
  </script>`

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
    ${darkModeReadabilityStyle}
  </head>
  <body${bodyClass}>
    ${doc.bodyHtml}
    ${externalLinkScript}
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
