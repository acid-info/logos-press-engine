import { AuthorsConfig } from '@/configs/data.configs'
import { siteConfigs } from '@/configs/site.configs'
import { strapiApi } from '@/services/strapi'
import { LPE } from '@/types/lpe.types'
import { getOpenGraphImageUrl } from '@/utils/og.utils'
import { getPostUrl, getWebsiteUrl } from '@/utils/route.utils'
import { formatTagText } from '@/utils/string.utils'
import { XMLBuilder, XMLParser } from 'fast-xml-parser'
import { Feed } from 'feed'
import { Category } from 'feed/lib/typings'
import { FeedOptions } from 'feed/src/typings'
import { writeFile } from 'fs/promises'
import path from 'path'

export class LPERssFeed {
  feed: Feed
  shows: any[] = []
  topics: any[] = []
  articleCategory!: Category
  showCategories!: Record<string, Category>
  showSlug?: string

  constructor(
    readonly name: string,
    opts: FeedOptions = {
      title: siteConfigs.title,
      description: siteConfigs.description,
      id: getWebsiteUrl(),
      link: getWebsiteUrl(),
      language: 'en',
      image: `${getWebsiteUrl()}/logo.png`,
      favicon: `${getWebsiteUrl()}/favicon.ico`,
      copyright: `All rights reserved ${new Date().getFullYear()}, ${
        siteConfigs.title
      }`,
    },
  ) {
    this.feed = new Feed({
      ...opts,
      id: this.getLink(),
      link: this.getLink(),
      feedLinks: {
        rss: this.getLink(),
      },
    })
  }

  async init() {
    // fetch fixed data
    const { data: shows } = await strapiApi.getPodcastShows({
      populateEpisodes: false,
    })
    const { data: topics } = await strapiApi.getTopics()
    this.shows = shows
    this.topics = topics

    this.buildCategories()
  }

  getPath() {
    return `./public/rss/${this.name}.xml`
  }

  getLink() {
    return `${getWebsiteUrl()}/rss/${this.name}.xml`
  }

  buildCategories() {
    const { shows } = this

    this.articleCategory = {
      name: 'Article',
      domain: getWebsiteUrl(),
    }

    this.showCategories = Object.fromEntries(
      shows.map((show) => [
        show.id,
        {
          name: `Podcast - ${show.title}`,
          domain: getPostUrl('podcast', { showSlug: show.slug }),
        },
      ]),
    )

    this.feed.addCategory(this.articleCategory.name!!)
    Object.values(this.showCategories || {}).forEach((cat) =>
      this.feed.addCategory(cat.name!!),
    )
  }

  addPost(post: LPE.Post.Document) {
    const { articleCategory, showCategories } = this

    this.feed.addItem({
      id: post.id,
      guid: post.id,
      title: post.title,
      // TODO - probably we should add publishedAt to the post
      date: new Date(post.modifiedAt!!),
      link: getPostUrl(post.type, {
        postSlug: post.slug,
        showSlug: (post.type === 'podcast' && this.showSlug) || null,
      }),
      author: post.authors.map((author) => ({
        name: author.name,
        ...(author.emailAddress &&
        !AuthorsConfig.hiddenEmailAddresses.includes(author.emailAddress)
          ? {
              email: author.emailAddress,
            }
          : {}),
      })),
      category: [
        ...(post.type === 'article'
          ? [articleCategory]
          : [showCategories[post.showId as string]]),
        ...post.tags.map(
          (tag) =>
            ({
              name: formatTagText(tag.name),
              domain: formatTagText(tag.name),
            } as Category),
        ),
      ],
      description: post.type === 'article' ? post.summary : post.description,
      image: getOpenGraphImageUrl({
        title: post.title,
        contentType: post.type,
        imageUrl: post.coverImage?.url,
        date: new Date(post.modifiedAt!!).toJSON(),
      }),
    })
  }

  async save() {
    const parser = new XMLParser({ ignoreAttributes: false })
    const obj = parser.parse(this.feed.rss2())
    const builder = new XMLBuilder({
      ignoreAttributes: false,
      format: true,
    })
    const xml = builder.build(obj)
    await writeFile(
      path.resolve(process.cwd(), this.getPath()),
      Buffer.from(xml),
    )
  }
}
