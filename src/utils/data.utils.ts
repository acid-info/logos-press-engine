import {
  GoogleDocEnhanced,
  TextBlockEnhanced,
  UnbodyGoogleDoc,
  UnbodyImageBlock,
  UnbodyTextBlock,
} from '@/lib/unbody/unbody.types'
import { UnbodyGraphQl } from '@/lib/unbody/unbody-content.types'
import { isAuthorsParagraph } from './html.utils'
import { extractUUIDFromEpisode, similarity } from './string.utils'
import { ArticleBlocksOrders } from '@/configs/data.configs'

function hasClassName(inputString: string, className: string) {
  const regex = new RegExp(`class\\s*=\\s*"[^"]*\\b${className}\\b[^"]*"`)
  return regex.test(inputString)
}

type Props = {
  blocks: Array<UnbodyImageBlock | TextBlockEnhanced>
  summary: string
  tags: string[]
  mentions: any[]
}

export const getBodyBlocks = ({
  blocks,
  summary,
  tags = [],
  mentions = [],
}: Props) => {
  return (blocks || []).filter((b) => {
    const classNames = b.classNames || []

    const isTitle = classNames.includes('title')
    const isSubtitle = classNames.includes('subtitle')

    const isCoverImage =
      b.order === ArticleBlocksOrders.cover &&
      b.__typename === UnbodyGraphQl.UnbodyDocumentTypeNames.ImageBlock

    const isAuthor =
      b.__typename === UnbodyGraphQl.UnbodyDocumentTypeNames.TextBlock &&
      similarity(b.text, mentions.map((m) => m.name).join('')) > 0.8

    const isSummary =
      b.__typename === UnbodyGraphQl.UnbodyDocumentTypeNames.TextBlock &&
      summary === b.text

    const isTag =
      b.__typename === UnbodyGraphQl.UnbodyDocumentTypeNames.TextBlock &&
      similarity(b.text, tags.map((t) => `#${t}`).join(' ')) > 0.8

    //TODO this is a hack to remove the footnotes from the body
    // we should find a better way to do this
    const isFootenots =
      b.__typename === UnbodyGraphQl.UnbodyDocumentTypeNames.TextBlock &&
      b.html.startsWith(`<div><p class="c15"><a href="#ftnt_`)

    return (
      !isTitle &&
      !isSubtitle &&
      !isCoverImage &&
      !isAuthor &&
      !isSummary &&
      !isTag &&
      !isFootenots
    )
  })
}

export const getArticleCover = (
  blocks: (UnbodyImageBlock | UnbodyTextBlock)[],
): UnbodyImageBlock | null => {
  return (
    ((blocks || []).find(
      (b) =>
        b.order === ArticleBlocksOrders.cover &&
        b.__typename === UnbodyGraphQl.UnbodyDocumentTypeNames.ImageBlock,
    ) as UnbodyImageBlock) || null
  )
}

export const shuffle = (array: any[]) => {
  let currentIndex = array.length,
    randomIndex

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--

    // And swap it with the current element.
    ;[array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ]
  }

  return array
}

export const getAudioSourceFromSimplecastPlayer = async (url: string) => {
  const myHeaders = new Headers()
  myHeaders.append(
    'Authorization',
    'Bearer eyJhcGlfa2V5IjoiMzg3OTdhY2Y5N2NmZjgzZjQxNGI5ODNiN2E2MjY3NmQifQ==',
  )

  const requestOptions = {
    method: 'GET',
    headers: myHeaders,
  }

  const result = await fetch(
    `https://api.simplecast.com/episodes/${url}`,
    requestOptions,
  )

  const data = await result.json()
  console.log(data)
  return data
}
