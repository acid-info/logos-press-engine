import { siteConfigs } from '@/configs/site.configs'
import { LPE } from '../types/lpe.types'

export type PostLinkData = {
  type?: LPE.PostType | LPE.StaticPage.Metadata['type']
  id?: string
  block?: string | number | null
  showSlug?: string | number | null
  postSlug?: string | number | null
  blockType?: LPE.Post.ContentBlockType | null
}

export const getPostLink = (
  postType: LPE.PostType | LPE.StaticPage.Metadata['type'],
  { id, block, showSlug, postSlug, blockType }: Omit<PostLinkData, 'type'> = {},
) => {
  let path =
    postType === 'article'
      ? `/article`
      : postType === 'podcast'
      ? `/podcasts/${showSlug || ''}`
      : ''

  if (postSlug) path += `/${postSlug}`
  if (id) path += `/id/${id}`

  if (blockType && block)
    path += `#${blockType === 'text' ? 'p' : 'i'}-${block}`

  return path
}

export const getPostUrl = (
  postType: LPE.PostType | LPE.StaticPage.Metadata['type'],
  opts: Omit<PostLinkData, 'type'> = {},
) => new URL(getPostLink(postType, opts), getWebsiteUrl()).toString()

export const parsePostUrl = (url: string): PostLinkData | null => {
  const { pathname, hash } = new URL(url)
  const path = pathname.split('/').filter((p) => p.length > 0)

  if (path.length === 0) return null

  const blockType: PostLinkData['blockType'] | null =
    hash && hash.startsWith('#i-')
      ? 'image'
      : hash.startsWith('#p-')
      ? 'text'
      : null

  const block: PostLinkData['block'] = blockType && parseInt(hash.slice(2), 10)

  if (path[0] === 'podcasts') {
    const [_t, showSlug, epSlug, idProp, id] = path
    return {
      type: 'podcast',
      showSlug,
      postSlug: epSlug,
      block,
      blockType,
      ...(idProp === 'id' && id
        ? {
            id,
          }
        : {}),
    }
  } else if (path[0] === 'article') {
    const [_t, slug, idProp, id] = path
    return {
      type: 'article',
      postSlug: slug,
      block,
      blockType,
      ...(idProp === 'id' && id
        ? {
            id,
          }
        : {}),
    }
  }

  const [slug, idProp, id] = path
  return {
    type: 'static_page',
    postSlug: slug,
    ...(idProp === 'id' && id
      ? {
          id,
        }
      : {}),
  }
}

export const getWebsiteUrl = () => {
  if (typeof window === 'undefined') return siteConfigs.url

  const url = new URL(window.location.href)
  return url.origin
}
