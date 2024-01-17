import { Transformer } from '../../../lib/TransformPipeline/types'
import { LPE } from '../../../types/lpe.types'
import { calcReadingTime } from '../../../utils/string.utils'
import { StrapiPostData } from '../strapi.types'
import { transformStrapiHtmlContent, transformStrapiImageData } from './utils'

export const postTransformer: Transformer<
  StrapiPostData,
  LPE.Post.Document,
  StrapiPostData,
  undefined,
  undefined
> = {
  key: 'PostTransformer',
  classes: ['post'],
  objectType: 'Post',
  isMatch: (helpers, object) => object.__typename === 'PostEntity',
  transform: (helpers, data, original, root, ctx) => {
    const { id, attributes } = data

    const type = attributes.type
    const title = attributes.title
    const subtitle = attributes.subtitle
    const slug = attributes.slug
    const publishedAt = attributes.publish_date
    const isHighlighted = attributes.featured
    const isDraft = !attributes.publishedAt
    const coverImage: LPE.Post.Document['coverImage'] =
      transformStrapiImageData(attributes.cover_image)
    const tags: LPE.Tag.Document[] = attributes.tags.data.map((tag) => ({
      id: tag.id,
      name: tag.attributes.name,
    }))

    const authors = attributes.authors.data.map((author) => ({
      id: author.id,
      name: author.attributes.name,
      emailAddress: author.attributes.email_address,
    }))

    const summary = transformStrapiHtmlContent({
      html: attributes.summary || '',
    }).text

    const {
      blocks: content,
      toc,
      text,
    } = transformStrapiHtmlContent({
      html: attributes.body || '',
    })

    // add the title as the first toc item
    {
      toc.unshift({
        href: '#title-anchor',
        blockIndex: -1,
        level: 0,
        tag: 'h1',
        title,
      })
    }

    if (type === 'Article') {
      return {
        id,
        title,
        subtitle,
        slug,
        modifiedAt: publishedAt,
        createdAt: publishedAt,
        coverImage,
        tags,
        content,
        summary,
        readingTime: calcReadingTime(text),
        toc,
        type: 'article',
        authors,
        highlighted: isHighlighted,
        isDraft,
      } as LPE.Article.Data
    } else {
      return {
        id,
        title,
        subtitle,
        slug,
        publishedAt: publishedAt,
        createdAt: publishedAt,
        coverImage,
        tags,
        channels: [],
        description: summary,
        type: 'podcast',
        isDraft,
        highlighted: isHighlighted,
        authors,
        content,
        episodeNumber: attributes.episode_number,
        showId: attributes.podcast_show.data?.id || null,
        modifiedAt: publishedAt,
        // will be filled in later
        credits: [],
        transcription: [],
      } as LPE.Podcast.Document
    }
  },
}
