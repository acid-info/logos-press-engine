import { DictValues } from '../utils/type.utils'

export namespace LPE {
  export const PostTypes = {
    Podcast: 'podcast',
    Article: 'article',
  } as const

  export type PostType = DictValues<typeof PostTypes>

  export namespace Tag {
    export type Document = {
      id: string
      name: string
      postsCount?: number
    }
  }

  export namespace Image {
    export type Document = {
      url: string
      alt: string
      width: number
      height: number
      caption?: string
      captionHTML?: string
      placeholder?: string
    }
  }

  export namespace Author {
    export type Document = {
      id: string
      name: string
      emailAddress?: string
    }
  }

  export namespace Post {
    export type Footnote = {
      index: number
      id: string
      refId: string
      refValue: string
      valueHTML: string
      valueText: string
    }

    export type Footnotes = Footnote[]

    export type TocItem = {
      level: number
      tag: string
      href: string
      title: string
      blockIndex: number
    }

    export type Toc = TocItem[]

    export const ContentBlockTypes = {
      Image: 'image',
      Text: 'text',
    } as const

    export type ContentBlockType = DictValues<typeof ContentBlockTypes>
    export const ContentBlockLabels = {
      Title: 'title',
      Subtitle: 'subtitle',
      Authors: 'authors',
      Summary: 'summary',
      Tags: 'tags',
      Footnote: 'footnote',
      Paragraph: 'paragraph',
      CoverImage: 'cover_image',
      Embed: 'embed',
      LinkOnly: 'link_only',
      YoutubeEmbed: 'youtube_embed',
      SimplecastEmbed: 'simplecast_embed',
    } as const

    export type ContentBlockLabel = DictValues<typeof ContentBlockLabels>

    export type ContentBlockCommon<D = any> = {
      id: string
      order: number
      labels: ContentBlockLabel[]
      document?: D
      footnotes?: Post.Footnotes
    }

    export type TextBlockEmbed = {
      src: string
      html: string
    }

    export type TextBlock<D = any> = ContentBlockCommon<D> & {
      text: string
      html: string
      tagName: string
      classNames: string[]
      type: Extract<ContentBlockType, 'text'>
      embed?: TextBlockEmbed
    }

    export type ImageBlock<D = any> = ContentBlockCommon<D> &
      Image.Document & {
        type: Extract<ContentBlockType, 'image'>
      }

    export type ContentBlock<D = any> = TextBlock<D> | ImageBlock<D>

    export type Document = LPE.Article.Data | LPE.Podcast.Document
  }

  export namespace StaticPage {
    export type TextBlock = Post.TextBlock<Metadata>
    export type ImageBlock = Post.ImageBlock<Metadata>
    export type ContentBlock = Post.ContentBlock<Metadata>
    export type Footnote = Post.Footnote
    export type Footnotes = Post.Footnotes
    export const ContentBlockLabels = Post.ContentBlockLabels
    export type ContentBlockLabel = Post.ContentBlockLabel

    export type Metadata = {
      id: string
      slug: string
      title: string
      summary: string
      subtitle: string
      isDraft?: boolean

      createdAt: string | null
      modifiedAt: string | null
      type: 'static_page'
    }

    export type Document = Metadata & {
      content: Array<Article.ContentBlock>
    }
  }

  export namespace Article {
    export type Toc = Post.Toc
    export type TocItem = Post.TocItem
    export type TextBlock = Post.TextBlock<Metadata>
    export type ImageBlock = Post.ImageBlock<Metadata>
    export type ContentBlock = Post.ContentBlock<Metadata>
    export type Footnote = Post.Footnote
    export type Footnotes = Post.Footnotes
    export const ContentBlockLabels = Post.ContentBlockLabels
    export type ContentBlockLabel = Post.ContentBlockLabel

    export type Metadata = {
      id: string
      uuid: string
      slug: string
      title: string
      summary: string
      subtitle: string
      authors: Author.Document[]
      tags: Tag.Document[]
      highlighted?: boolean
      isDraft?: boolean
      discourse_topic_id?: number

      createdAt: string | null
      modifiedAt: string | null
      publishedAt: string | null
      type: typeof LPE.PostTypes.Article
    }

    export type Data = Article.Metadata & {
      toc: Post.Toc
      readingTime: number
      coverImage: Image.Document | null
      content: Array<Article.ContentBlock>
    }

    export type Document = {
      data: Article.Data
      relatedArticles: Article.Metadata[]
      articlesFromSameAuthors: Article.Metadata[]
    }
  }

  export namespace Podcast {
    export type Show = {
      id: string
      slug: string
      url: string
      title: string
      description: string
      descriptionText?: string
      logo: Image.Document
      hosts: Author.Document[]
      numberOfEpisodes: number
      episodes?: Omit<Podcast.Document, 'show'>[]
    }

    export const ChannelNames = {
      ApplePodcasts: 'apple_podcasts',
      GooglePodcasts: 'google_podcasts',
      Spotify: 'spotify',
      Youtube: 'youtube',
      Simplecast: 'simplecast',
    } as const

    export type ChannelName = DictValues<typeof ChannelNames>

    export type SimplecastChannelData = {
      duration: number
      audioFileUrl: string
    }

    export type Channel =
      | {
          name: ChannelName
          url: string
        }
      | {
          name: typeof ChannelNames.Simplecast
          url: string
          data: SimplecastChannelData
        }

    export type Metadata = {
      id: string
      uuid: string
      slug: string
      title: string
      tags: Tag.Document[]
      description: string
      authors: Author.Document[]
      publishedAt: string
      modifiedAt: string
      episodeNumber: number
      showId?: string
      highlighted?: boolean
      isDraft?: boolean
      discourse_topic_id?: number
      coverImage?: Image.Document
      show?: Show
      summary?: string
      type: typeof LPE.PostTypes.Podcast
    }

    export type TranscriptionItem = {
      html: string
      start?: number
      end?: number
      speaker?: string
    }

    export type Content = {
      channels: Channel[]
      credits: Post.TextBlock[]
      content: Post.ContentBlock<Metadata>[]
      transcription: TranscriptionItem[]
    }

    export type Document = Metadata & Content
  }

  export const ContentTypes = {
    ...PostTypes,
    ...Post.ContentBlockTypes,
  } as const

  export type ContentType = DictValues<typeof ContentTypes>

  export namespace Search {
    export type ResultItemBase<T> = {
      score: number
      data: T
      type: ContentType
    }

    export type ResultBlockItem =
      | ResultItemBase<LPE.Post.TextBlock>
      | ResultItemBase<LPE.Post.ImageBlock>

    export type ResultItem = ResultItemBase<LPE.Post.Document> | ResultBlockItem

    export type Result = {
      posts: Search.ResultItem[]
      blocks: Search.ResultItem[]
      total?: number
      hasMore?: boolean
    }
  }

  export namespace Discourse {
    export interface Post {
      id: number
      username: string
      avatar_template: string
      created_at: string
      cooked: string
      display_username: string | null
    }

    export interface TopicResponse {
      id: number
      slug: string
      title: string
      posts_count: number
      like_count: number
      post_stream: {
        posts: Post[]
      }
    }

    export interface CreateTopicRequest {
      title: string
      raw: string
      category?: number
      archetype?: 'regular' | 'private_message'
      created_at?: string
      reply_to_post_number?: number
      embed_url?: string
    }

    export interface CreateTopicResponse extends Post {
      topic_id: number
      topic_slug?: string
    }

    export type Action = 'getTopic' | 'createTopic'
  }
}
