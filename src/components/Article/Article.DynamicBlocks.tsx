/** @jsxImportSource @emotion/react */
import { Typography } from '@acid-info/lsd-react'
import styled from '@emotion/styled'
import { useEffect, useMemo, useRef, useState } from 'react'
import { LPE } from '../../types/lpe.types'

interface Props {
  blocks: LPE.Post.DynamicBlock[]
}

function addTargetBlank(html: string) {
  return html.replace(
    /<a\s+(?![^>]*target=)/gi,
    '<a target="_blank" rel="noopener noreferrer" ',
  )
}

function safeScript(js: string) {
  return js.replace(/<\/script>/gi, '<\\/script>')
}

const CSP_META = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data: https:; style-src 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; script-src 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com https://unpkg.com; connect-src https:;">`

function injectCspMeta(html: string) {
  if (/<meta[^>]+http-equiv=["']Content-Security-Policy["']/i.test(html)) {
    return html
  }
  if (/<head[^>]*>/i.test(html)) {
    return html.replace(/<head[^>]*>/i, (m) => `${m}\n    ${CSP_META}`)
  }
  if (/<html\b[^>]*>/i.test(html)) {
    return html.replace(
      /<html\b[^>]*>/i,
      (m) => `${m}\n  <head>\n    ${CSP_META}\n  </head>`,
    )
  }
  if (/<body\b[^>]*>/i.test(html)) {
    return html.replace(
      /<body\b[^>]*>/i,
      (m) => `  <head>\n    ${CSP_META}\n  </head>\n${m}`,
    )
  }
  return `<!doctype html>
<html>
  <head>
    ${CSP_META}
  </head>
  <body>
    ${html}
  </body>
</html>`
}

function buildSrcDoc(
  block: LPE.Post.DynamicInteractiveEmbedBlock,
  autoHeight: boolean,
  frameId: string,
) {
  const linkScript = `<script>
  (function () {
    var links = document.querySelectorAll('a[href]');
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      if (!a.getAttribute('target')) a.setAttribute('target', '_blank');
      var rel = a.getAttribute('rel') || '';
      if (rel.indexOf('noopener') === -1) rel = (rel + ' noopener').trim();
      if (rel.indexOf('noreferrer') === -1) rel = (rel + ' noreferrer').trim();
      a.setAttribute('rel', rel);
    }
  })();
</script>`

  const heightScript = autoHeight
    ? `
    <script>
      (function () {
        var frameId = ${JSON.stringify(frameId)};
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
            parent.postMessage({ type: 'lpe-embed-height', frameId: frameId, height: h }, '*');
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

        function onLoad() {
          schedulePost();
        }

        function onResize() {
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
    : ''

  const fullHtml = block.fullHtml || ''
  if (fullHtml.trim().length > 0) {
    const looksLikeDocument = /<!doctype|<html\b|<head\b|<body\b/i.test(
      fullHtml,
    )
    return looksLikeDocument
      ? injectCspMeta(
          fullHtml
            .replace(
              /<head[^>]*>/i,
              (m) => `${m}
    <style>
      html, body { overflow: hidden; }
    </style>`,
            )
            .replace(
              /<\/body>/i,
              `
${linkScript}
${heightScript}
</body>`,
            ),
        )
      : `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    ${CSP_META}
    <style>
      html, body { overflow: hidden; }
    </style>
  </head>
  <body>
    ${fullHtml}
    ${linkScript}
    ${heightScript}
  </body>
</html>`
  }

  const css = block.css || ''
  const html = block.html || ''
  const js = block.js ? safeScript(block.js) : ''

  const hasDocumentMarkup = /<!doctype|<html\b|<head\b|<body\b/i.test(html)
  if (hasDocumentMarkup && !css && !js) {
    return html
      .replace(
        /<head[^>]*>/i,
        (m) => `${m}
    <style>
      html, body { overflow: hidden; }
    </style>`,
      )
      .replace(
        /<\/body>/i,
        `
${linkScript}
${heightScript}
</body>`,
      )
  }

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    ${CSP_META}
    <style>
      html, body { margin: 0; padding: 0; overflow: hidden; }
      ${css}
    </style>
  </head>
  <body>
    ${html}
    ${js ? `<script>${js}<\/script>` : ''}
    ${linkScript}
    ${heightScript}
  </body>
</html>`
}

const InteractiveEmbedFrame = ({
  block,
  index,
}: {
  block: LPE.Post.DynamicInteractiveEmbedBlock
  index: number
}) => {
  const frameId = useMemo(() => `lpe-embed-${index}`, [index])
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const autoHeight = block.height == null
  const [height, setHeight] = useState<number>(block.height ?? 480)

  useEffect(() => {
    if (!autoHeight) return
    const handler = (event: MessageEvent) => {
      if (
        !iframeRef.current ||
        event.source !== iframeRef.current.contentWindow
      )
        return
      if (!event.data || event.data.type !== 'lpe-embed-height') return
      if (event.data.frameId !== frameId) return
      const next = Number(event.data.height)
      if (!Number.isFinite(next) || next <= 0) return
      setHeight(Math.max(200, Math.ceil(next)))
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [autoHeight, frameId])

  return (
    <EmbedFrame
      ref={iframeRef}
      title={block.title || 'Interactive content'}
      height={height}
      sandbox="allow-scripts allow-popups"
      loading="lazy"
      scrolling="no"
      srcDoc={buildSrcDoc(block, autoHeight, frameId)}
    />
  )
}

const ArticleDynamicBlocks = ({ blocks }: Props) => {
  return (
    <Container>
      {blocks.map((block, idx) => {
        switch (block.type) {
          case LPE.Post.DynamicBlockTypes.RichText:
            return (
              <RichText
                key={`rich-text-${idx}`}
                variant="body1"
                component="div"
                genericFontFamily="sans-serif"
                dangerouslySetInnerHTML={{ __html: addTargetBlank(block.body) }}
              />
            )
          case LPE.Post.DynamicBlockTypes.CodeBlock:
            return (
              <CodeBlock key={`code-block-${idx}`}>
                <code
                  className={block.language ? `language-${block.language}` : ''}
                >
                  {block.code}
                </code>
              </CodeBlock>
            )
          case LPE.Post.DynamicBlockTypes.InteractiveEmbed:
            return (
              <InteractiveEmbedFrame
                key={`interactive-embed-${idx}`}
                block={block}
                index={idx}
              />
            )
          default:
            return null
        }
      })}
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`

const RichText = styled(Typography)`
  &.subtitle,
  &#p-2 {
    font-size: var(--lsd-h6-fontSize);
    line-height: var(--lsd-h6-lineHeight);
  }

  .u-font-weight-700,
  .u-font-weight-800,
  .u-font-weight-900,
  .u-font-weight-bold {
    font-weight: bold;
  }
  .u-font-style-italic {
    font-style: italic;
  }
  .u-text-decoration-underline {
    text-decoration: underline;
  }
  .u-text-decoration-line-through {
    text-decoration: line-through;
  }
  &.u-text-align-center {
    text-align: center;
  }

  & > strong {
    margin-bottom: 16px;
  }

  & table {
    width: 100%;
    border-collapse: collapse;
    margin: 1.5rem 0;

    & th,
    & td {
      padding: 12px 16px;
      border: 1px solid rgb(var(--lsd-border-primary));
      text-align: left;
    }

    & th {
      background-color: rgb(var(--lsd-palette-background-secondary));
      font-weight: 600;
    }
  }
`

const CodeBlock = styled.pre`
  background: rgb(var(--lsd-palette-background-secondary));
  border: 1px solid rgb(var(--lsd-border-primary));
  border-radius: 8px;
  padding: 16px;
  overflow-x: auto;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    'Liberation Mono', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;

  code {
    white-space: pre-wrap;
  }
`

const EmbedFrame = styled.iframe`
  width: 100%;
  border: none;
  overflow: hidden;
`

export default ArticleDynamicBlocks
