import { PlaceholderService } from '@/services/images.service'
import { isVercel } from '@/utils/env.utils'
import * as htmlParser from 'node-html-parser'
import slugify from 'slugify'
import { UploadFileEntity } from '../../../lib/strapi/strapi.generated'
import { LPE } from '../../../types/lpe.types'
import { convertToIframe } from '../../../utils/string.utils'

let assetsBaseUrl = process.env.NEXT_PUBLIC_ASSETS_BASE_URL ?? ''
if (assetsBaseUrl.endsWith('/')) assetsBaseUrl = assetsBaseUrl.slice(1)

const placeholderService = new PlaceholderService()
placeholderService.emptyCache()

// TODO: remove this and move it to a proper place
type StrapiImage =
  | Pick<UploadFileEntity, 'attributes'>
  | {
      data: {
        attributes: Partial<UploadFileEntity['attributes']>
      }
    }

export const getStrapiImageUrlBySize = (size: string, url: string): string =>
  url.replace('/uploads/', `/uploads/${size}_`)

export const transformStrapiImageUrl = (filePath: string): string =>
  assetsBaseUrl + filePath

export const transformStrapiImageData = async (
  image: StrapiImage,
): Promise<LPE.Image.Document> => {
  const attributes = 'data' in image ? image.data?.attributes : image.attributes

  if (!attributes || !attributes.url) {
    return {
      height: 0,
      width: 0,
      caption: '',
      alt: '',
      url: '',
      placeholder: '',
    }
  }

  return {
    height: attributes.height || 0,
    width: attributes.width || 0,
    caption: attributes.caption || '',
    alt: attributes.caption || attributes.alternativeText || '',
    url: attributes.url ? transformStrapiImageUrl(attributes.url) : '',
    placeholder: attributes.url
      ? isVercel()
        ? getStrapiImageUrlBySize(
            'thumbnail',
            transformStrapiImageUrl(attributes.url),
          )
        : await (async () => {
            try {
              return await placeholderService.pixelate(attributes.url as string)
            } catch (e) {
              return transformStrapiImageUrl(attributes.url as string)
            }
          })()
      : '',
  }
}

export const transformStrapiHtmlContent = async ({
  html,
}: {
  html: string
}): Promise<{
  toc: LPE.Post.TocItem[]
  blocks: LPE.Post.ContentBlock[]
  html: string
  text: string
}> => {
  const toc: LPE.Post.TocItem[] = []
  const blocks: LPE.Post.ContentBlock[] = []

  // split paragraphs with <br> into multiple paragraphs
  html = html.replaceAll(
    /<p(\s+[^>]*)?>(.*?)<br>(.*?)<\/p>/g,
    (match, p1, p2, p3) =>
      [p2, p3]
        .join('<br>')
        .split('<br>')
        .map((p) => `<p${p1 || ''}>${p}</p>`)
        .join(''),
  )

  let root = htmlParser.parse(html, { parseNoneClosedTags: true })

  // remove footnotes container as the content is already stored in sup tags
  root.querySelectorAll('section.footnotes-container').forEach((node) => {
    node.remove()
  })

  let blockIndex = -1

  for (const child of root.childNodes) {
    if (!(child instanceof htmlParser.HTMLElement)) {
      continue
    }

    const { node, footnotes } = parseFootnotes(child)

    // remove footnotes before parsing the text content
    const clone = node.clone() as htmlParser.HTMLElement
    clone.querySelectorAll('a.footnote').forEach((a) => {
      a.remove()
    })

    const text = clone.textContent || ''

    const tagName = node.tagName.toLowerCase()
    const isFigure = tagName === 'figure'
    const isMedia = isFigure && !!node.querySelector('oembed')
    const isImage = !!node.querySelector('img')
    const empty = node.text.length === 0

    if (!isFigure && !isImage && empty) continue

    blockIndex++

    if (isImage) {
      const image = node.querySelector('img')
      if (!image) {
        blockIndex--
        continue
      }

      const caption = text
      const alt = image.getAttribute('alt') || ''
      let url = image.getAttribute('src') || ''
      url = url.slice(url.indexOf('/uploads/'))
      const width = parseInt(image.getAttribute('width') || '0', 10)
      const height = parseInt(image.getAttribute('height') || '0', 10)

      blocks.push({
        id: '',
        caption,
        captionHTML: node.querySelector('figcaption')?.innerHTML || '',
        type: 'image',
        width,
        height,
        alt: alt || caption,
        labels: [],
        order: blockIndex,
        placeholder: isVercel()
          ? getStrapiImageUrlBySize('thumbnail', url)
          : await (async () => {
              try {
                return await placeholderService.pixelate(url)
              } catch (e) {
                return url
              }
            })(),
        url: url.startsWith('/') ? transformStrapiImageUrl(url) : url,
        footnotes,
      })

      continue
    }

    if (isMedia) {
      const labels: LPE.Post.ContentBlockLabel[] = ['embed']

      const oembed = node.querySelector('oembed')
      const url = oembed?.getAttribute('url') || ''
      if (!url) {
        blockIndex--

        continue
      }

      const youtube = html.match(
        /(https?\:\/\/)?((www\.)?youtube\.com|youtu\.?be)\/[^ "]+/gi,
      )

      const simplecast = html.match(
        /(https?\:\/\/)?((player\.)?simplecast\.com)\/[^ "]+/gi,
      )

      const label = youtube?.[0]
        ? LPE.Post.ContentBlockLabels.YoutubeEmbed
        : LPE.Post.ContentBlockLabels.SimplecastEmbed

      const src = youtube?.[0] || simplecast?.[0]
      if (src && src.length > 0) {
        labels.push(label)
        labels.push(LPE.Post.ContentBlockLabels.Embed)
      }

      blocks.push({
        id: `p-${blockIndex}`,
        order: 0,
        type: 'text',
        classNames: [],
        footnotes: [],
        html: node.outerHTML,
        labels,
        tagName: 'p',
        text: url,
        embed: {
          src: url,
          html: convertToIframe(url),
        },
      })
    }

    const isHeading = tagName.startsWith('h')
    const id =
      node.id ||
      (isHeading && slugify(text, { lower: true, trim: true })) ||
      `p-${blockIndex}`
    node.setAttribute('id', id)

    if (isHeading) {
      toc.push({
        blockIndex,
        href: `#${id}`,
        level: parseInt(tagName[1], 10),
        tag: tagName,
        title: text.trim(),
      })
    }

    blocks.push({
      id: '',
      text,
      footnotes,
      html: node.outerHTML,
      labels: [],
      tagName,
      order: blockIndex,
      classNames: Array.from(node.classList.values()),
      type: 'text',
    } as LPE.Post.TextBlock)
  }

  return {
    toc,
    blocks,
    text: root.text,
    html: root.innerHTML,
  }
}

const parseFootnotes = (
  node: htmlParser.HTMLElement,
): {
  node: htmlParser.HTMLElement
  footnotes: LPE.Post.Footnotes
} => {
  const footnotes = [] as LPE.Post.Footnotes

  const clone = node.clone() as htmlParser.HTMLElement

  clone.querySelectorAll('sup.footnote').forEach((sup, idx) => {
    const id = sup.getAttribute('data-id') || ''
    const index = parseInt(sup.getAttribute('data-index') || '', 10)
    const footnote = htmlParser.parse(sup.getAttribute('data-content') || '')

    const refId = `fntref-${id}`
    const footnoteId = `fnt-${id}`

    const anchor = htmlParser.parse(
      `<a class="footnote" href="#${footnoteId}"><sup><span class="anchor" id="${refId}"></span><span>[${index}]</span></sup></a>`,
    )

    sup.replaceWith(anchor)

    footnote.querySelectorAll('a').forEach((a) => {
      a.setAttribute('target', '_blank')
    })

    footnotes.push({
      id,
      index,
      refId,
      refValue: anchor.textContent,
      valueHTML: footnote.outerHTML,
      valueText: footnote.textContent,
    })
  })

  return {
    footnotes,
    node: clone,
  }
}
