import Head from 'next/head'
import { useEffect } from 'react'
import { LPE } from '../../types/lpe.types'

type Props = {
  doc: LPE.Post.HtmlDocument
}

const ArticleHtmlDocument = ({ doc }: Props) => {
  return (
    <>
      <Head>
        {doc.title && <title>{doc.title}</title>}
        {doc.metas.map((meta, index) => (
          <meta key={`meta-${index}`} {...meta} />
        ))}
        {doc.links.map((link, index) => (
          <link
            key={`link-${index}`}
            {...link}
            crossOrigin={
              link.crossOrigin === '' ||
              link.crossOrigin === 'anonymous' ||
              link.crossOrigin === 'use-credentials'
                ? link.crossOrigin
                : undefined
            }
          />
        ))}
        {doc.styles.map((style, index) => (
          <style
            key={`style-${index}`}
            dangerouslySetInnerHTML={{ __html: style }}
          />
        ))}
      </Head>
      <HtmlScriptLoader scripts={doc.scripts} />
      <div
        className={doc.bodyClass}
        dangerouslySetInnerHTML={{ __html: doc.bodyHtml }}
        suppressHydrationWarning
      />
    </>
  )
}

const HtmlScriptLoader = ({ scripts }: { scripts: LPE.Post.HtmlScript[] }) => {
  useEffect(() => {
    let cancelled = false

    const run = async () => {
      let hasBabelScripts = false
      for (const script of scripts) {
        if (cancelled) break
        if (script.src) {
          await new Promise<void>((resolve) => {
            const el = document.createElement('script')
            el.src = script.src as string
            if (script.type) el.type = script.type
            if (script.noModule) el.noModule = true
            el.async = false
            el.defer = false
            el.onload = () => resolve()
            el.onerror = () => resolve()
            document.body.appendChild(el)
          })
        } else if (script.content) {
          const el = document.createElement('script')
          if (script.type) el.type = script.type
          el.text = script.content
          document.body.appendChild(el)
          if (script.type === 'text/babel') {
            hasBabelScripts = true
          }
        }
      }

      if (hasBabelScripts) {
        const babel = (window as any).Babel
        if (babel && typeof babel.transformScriptTags === 'function') {
          babel.transformScriptTags()
        }
      }
    }

    run()

    return () => {
      cancelled = true
    }
  }, [scripts])

  return null
}

export default ArticleHtmlDocument
