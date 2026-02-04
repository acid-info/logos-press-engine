import {
  GetPodcastShowsQuery,
  GetPostsQuery,
  GetStaticPagesQuery,
} from '../../lib/strapi/strapi.generated'

type BaseStrapiPostData = GetPostsQuery['posts']['data'][number]
type BaseStrapiPostAttributes = NonNullable<BaseStrapiPostData['attributes']>

export type StrapiPostBlock =
  | {
      __typename: 'ComponentBlocksRichText'
      id?: string | null
      body?: string | null
    }
  | {
      __typename: 'ComponentBlocksCodeBlock'
      id?: string | null
      language?: string | null
      code?: string | null
    }
  | {
      __typename: 'ComponentBlocksInteractiveEmbed'
      id?: string | null
      title?: string | null
      full_html?: string | null
      html?: string | null
      css?: string | null
      js?: string | null
      height?: number | null
    }

export type StrapiPostData = BaseStrapiPostData & {
  attributes: BaseStrapiPostAttributes & {
    blocks?: StrapiPostBlock[] | null
  }
}
export type StrapiPodcastShowData =
  GetPodcastShowsQuery['podcastShows']['data'][number]
export type StrapiStaticPageData = GetStaticPagesQuery['pages']['data'][number]
