import * as _uuid from 'uuid'
import { Transformer } from '../../../lib/TransformPipeline/types'
import { LPE } from '../../../types/lpe.types'
import { calcReadingTime } from '../../../utils/string.utils'
import postSearchService from '../../post-search.service'
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
  transform: async (helpers, data, original, root, ctx) => {
    const { id, attributes } = data
    const uuid = _uuid.v5(id, _uuid.v5.URL)

    const type = attributes.type
    const title = attributes.title
    const subtitle = attributes.subtitle
    const slug = attributes.slug
    const publishedAt = attributes.publish_date
    const isHighlighted = attributes.featured
    const isDraft = !attributes.publishedAt
    const discourseTopicId = attributes.discourse_topic_id
    const coverImage: LPE.Post.Document['coverImage'] =
      await transformStrapiImageData(attributes.cover_image)
    const tags: LPE.Tag.Document[] = attributes.tags.data.map((tag) => ({
      id: tag.id,
      name: tag.attributes.name,
    }))

    const authors = attributes.authors.data.map((author) => ({
      id: author.id,
      name: author.attributes.name,
      emailAddress: author.attributes.email_address,
    }))

    const summary = await transformStrapiHtmlContent({
      html: attributes.summary || '',
    }).then((h) => h.text)

    const {
      blocks: content,
      toc,
      text,
    } = await transformStrapiHtmlContent({
      html: attributes.body || '',
    })

    if (attributes.body && content.length > 0) {
      postSearchService.index({
        id: uuid,
        content,
      })
    }

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
        uuid,
        title,
        subtitle,
        slug,
        modifiedAt: publishedAt,
        createdAt: publishedAt,
        publishedAt,
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
        discourse_topic_id: discourseTopicId,
      } as LPE.Article.Data
    } else {
      return {
        id,
        uuid,
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
        summary: attributes.summary,
        showId: attributes.podcast_show.data?.id || null,
        modifiedAt: publishedAt,
        discourse_topic_id: discourseTopicId,
        // will be filled in later
        credits: [],
        transcription: [],
      } as LPE.Podcast.Document
    }
  },
}
