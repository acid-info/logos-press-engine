import styled from '@emotion/styled'
import Head from 'next/head'
import { useEffect, useMemo, useRef } from 'react'
import { useIsDarkTheme } from '../../states/themeState'
import { LPE } from '../../types/lpe.types'

type Props = {
  doc: LPE.Post.HtmlDocument
}

const ArticleHtmlDocument = ({ doc }: Props) => {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const isDarkTheme = useIsDarkTheme()
  const bodyHtml = useMemo(() => addTargetBlank(doc.bodyHtml), [doc.bodyHtml])
  const className = useMemo(
    () =>
      ['lpe-html-document-root', doc.bodyClass || ''].filter(Boolean).join(' '),
    [doc.bodyClass],
  )

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const mountNode = root

    let disposed = false
    const insertedScripts: HTMLScriptElement[] = []

    async function runScripts() {
      for (const script of doc.scripts) {
        if (disposed) break

        const scriptEl = document.createElement('script')
        if (script.type) scriptEl.type = script.type
        if (script.noModule) scriptEl.noModule = true
        scriptEl.defer = !!script.defer
        scriptEl.async = !!script.async

        if (script.src) {
          scriptEl.src = script.src
          await new Promise<void>((resolve) => {
            scriptEl.onload = () => resolve()
            scriptEl.onerror = () => resolve()
            mountNode.appendChild(scriptEl)
          })
        } else if (script.content) {
          scriptEl.text = script.content
          mountNode.appendChild(scriptEl)
        } else {
          continue
        }

        insertedScripts.push(scriptEl)
      }
    }

    void runScripts()

    return () => {
      disposed = true
      insertedScripts.forEach((scriptEl) => {
        scriptEl.remove()
      })
    }
  }, [doc.scripts])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    function isExternalHttpsLink(rawHref: string | null | undefined) {
      if (!rawHref) return false
      try {
        const url = new URL(rawHref, window.location.href)
        return (
          url.protocol === 'https:' && url.origin !== window.location.origin
        )
      } catch (error) {
        return false
      }
    }

    function hardenLink(anchor: HTMLAnchorElement) {
      anchor.setAttribute('target', '_blank')
      const rel = anchor.getAttribute('rel') || ''
      const tokens = rel.split(/\s+/).filter(Boolean)
      if (!tokens.includes('noopener')) tokens.push('noopener')
      if (!tokens.includes('noreferrer')) tokens.push('noreferrer')
      anchor.setAttribute('rel', tokens.join(' '))
    }

    function processLinks(container: ParentNode) {
      const links = container.querySelectorAll('a[href]')
      links.forEach((link) => {
        if (isExternalHttpsLink(link.getAttribute('href'))) {
          hardenLink(link as HTMLAnchorElement)
        }
      })
    }

    function handleClick(event: Event) {
      const target = event.target as Element | null
      if (!target) return
      const anchor = target.closest('a[href]')
      if (!anchor) return
      if (!isExternalHttpsLink(anchor.getAttribute('href'))) return
      hardenLink(anchor as HTMLAnchorElement)
    }

    processLinks(root)
    root.addEventListener('click', handleClick, true)

    const observer = new MutationObserver(() => processLinks(root))
    observer.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['href'],
    })

    return () => {
      root.removeEventListener('click', handleClick, true)
      observer.disconnect()
    }
  }, [])

  return (
    <>
      <Head>
        {doc.metas
          .filter(
            (meta) =>
              !meta.charset &&
              meta.name?.toLowerCase() !== 'viewport' &&
              !(
                meta.httpEquiv &&
                meta.httpEquiv.toLowerCase() === 'content-security-policy'
              ),
          )
          .map((meta, index) => (
            <meta
              key={`html-doc-meta-${index}`}
              name={meta.name}
              content={meta.content}
              property={meta.property}
              httpEquiv={meta.httpEquiv}
            />
          ))}
        {doc.links.map((link, index) => (
          <link
            key={`html-doc-link-${index}`}
            rel={link.rel}
            href={link.href}
            as={link.as}
            type={link.type}
            crossOrigin={normalizeCrossOrigin(link.crossOrigin)}
          />
        ))}
        {doc.styles.map((style, index) => (
          <style
            key={`html-doc-style-${index}`}
            dangerouslySetInnerHTML={{ __html: style }}
          />
        ))}
        {isDarkTheme ? (
          <style
            dangerouslySetInnerHTML={{ __html: darkModeReadabilityStyle }}
          />
        ) : null}
      </Head>
      <DocumentRoot
        ref={rootRef}
        className={className}
        dangerouslySetInnerHTML={{ __html: bodyHtml }}
      />
    </>
  )
}

function normalizeCrossOrigin(value?: string) {
  if (value === '' || value === 'anonymous' || value === 'use-credentials') {
    return value
  }
  return undefined
}

function addTargetBlank(html: string) {
  return html.replace(
    /<a\b(?![^>]*\btarget=)([^>]*?)>/gi,
    '<a target="_blank" rel="noopener noreferrer"$1>',
  )
}

const darkModeReadabilityStyle = `
  .lpe-html-document-root,
  .lpe-html-document-root[class],
  .lpe-html-document-root :where([class*="s0-"], [style*="--s0-bg-surface"]) {
    --s0-bg-surface: transparent !important;
    --s0-bg: transparent !important;
    --s0-text-dim: #aeb8d7 !important;
    --s0-text: #d7def2 !important;
    --s0-text-secondary: #c3cce6 !important;
    --s0-accent-text: #e09ca8 !important;
    --s0-accent: #ff8ea1 !important;
  }
  .lpe-html-document-root :where(h1, h2, h3, h4, h5, h6, p, li, blockquote, figcaption) {
    color: #a7b0cf !important;
  }
  .lpe-html-document-root :where(strong, b) {
    color: #c2c9e3 !important;
  }
  .lpe-html-document-root :where(.s0-pull-quote, [class*="pull-quote"]) {
    color: #b6bfdc !important;
  }
  .lpe-html-document-root :where(.s0-pull-quote, [class*="pull-quote"]) :where(*, strong, b, em, i, p, span) {
    color: inherit !important;
  }
  .lpe-html-document-root :where(.s0-demo-header, [class*="s0-demo-header"]) {
    color: #626d8d !important;
  }
  .lpe-html-document-root :where(.s0-demo-header, [class*="s0-demo-header"]) :where(*, strong, b, em, i, p, span) {
    color: inherit !important;
  }
  .lpe-html-document-root :where(code, kbd, samp) {
    color: #f8f8fa !important;
  }
  .lpe-html-document-root :where(code, kbd, samp) :where(*, strong, b, em, i, span) {
    color: inherit !important;
  }
`

const DocumentRoot = styled.div`
  width: 100%;
  border: 0;
  display: block;
  overflow-x: hidden;
`

export default ArticleHtmlDocument
