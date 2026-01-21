import { LPERssFeed } from '@/services/rss.service'
import { LPESitemapGenerator } from '@/services/sitemap.service'
import { stat } from 'fs/promises'
import { CustomNextPage, GetStaticProps } from 'next'
import NextAdapterPages from 'next-query-params'
import path from 'path'
import { ReactNode } from 'react'
import { QueryParamProvider } from 'use-query-params'
import SEO from '../components/SEO/SEO'
import {
  ADMIN_ACID_API_URL,
  CALENDAR_PUBLIC_PATH,
  FEATURED_ARTICLES_LIMIT,
  FEATURED_EPISODES_LIMIT,
} from '../configs/consts.configs'
import { HomePage, HomePageProps } from '../containers/HomePage'
import { DefaultLayout } from '../layouts/DefaultLayout'
import logger from '../lib/logger'
import { Enum_Post_Type } from '../lib/strapi/strapi.generated'
import { strapiApi } from '../services/strapi'
import { CalendarEvent } from '../types/data.types'

type PageProps = Pick<
  HomePageProps,
  | 'data'
  | 'articlesMoreData'
  | 'episodesMoreData'
  | 'calendarEvents'
  | 'calendarError'
>

// 24 hours
const DAY_MS = 24 * 60 * 60 * 1000

// Check if a file is older than a certain age
async function isFileOlderThan(
  filePath: string,
  ageMs: number,
): Promise<boolean> {
  try {
    const s = await stat(filePath)
    // If the file is older than the age, return true
    return Date.now() - s.mtime.getTime() > ageMs
  } catch {
    // If file doesn't exist or can't be read, treat as stale
    return true
  }
}

const Page: CustomNextPage<PageProps> = (props) => {
  return (
    <>
      <SEO rssFileName={'main.rss'} />
      <HomePage
        data={props.data}
        articlesMoreData={props.articlesMoreData}
        episodesMoreData={props.episodesMoreData}
        calendarEvents={props.calendarEvents}
        calendarError={props.calendarError}
      />
    </>
  )
}

Page.getLayout = function getLayout(page: ReactNode) {
  return (
    <QueryParamProvider adapter={NextAdapterPages}>
      <DefaultLayout
        mainProps={{ spacing: false, contentPadding: false }}
        navbarProps={{ defaultState: { showTitle: false } }}
      >
        {page}
      </DefaultLayout>
    </QueryParamProvider>
  )
}

export const getStaticProps: GetStaticProps<PageProps> = async () => {
  const { data: allHighlightedArticlesResponse } = await strapiApi.getPosts({
    highlighted: 'only',
    filters: {
      type: {
        eq: 'Article' as Enum_Post_Type,
      },
    },
  })

  const allHighlightedArticles = allHighlightedArticlesResponse.data

  const initialHighlightedArticles = allHighlightedArticles.slice(
    0,
    FEATURED_ARTICLES_LIMIT,
  )

  const remainingHighlightedArticles = allHighlightedArticles.slice(
    FEATURED_ARTICLES_LIMIT,
  )

  const articlesNeeded =
    FEATURED_ARTICLES_LIMIT - initialHighlightedArticles.length

  let nonHighlightedArticles: any[] = []

  if (articlesNeeded > 0) {
    const { data: nonHighlightedResponse } = await strapiApi.getPosts({
      highlighted: 'exclude',
      filters: {
        type: {
          eq: 'Article' as Enum_Post_Type,
        },
      },
      limit: articlesNeeded,
    })
    nonHighlightedArticles = nonHighlightedResponse.data
  }

  const initialArticles = [
    ...initialHighlightedArticles,
    ...nonHighlightedArticles,
  ]

  const { data: allHighlightedEpisodesResponse } = await strapiApi.getPosts({
    highlighted: 'only',
    filters: {
      type: {
        eq: 'Episode' as Enum_Post_Type,
      },
    },
  })

  const allHighlightedEpisodes = allHighlightedEpisodesResponse.data

  const initialHighlightedEpisodes = allHighlightedEpisodes.slice(
    0,
    FEATURED_EPISODES_LIMIT,
  )

  const remainingHighlightedEpisodes = allHighlightedEpisodes.slice(
    FEATURED_EPISODES_LIMIT,
  )

  const episodesNeeded =
    FEATURED_EPISODES_LIMIT - initialHighlightedEpisodes.length

  let nonHighlightedEpisodes: any[] = []

  if (episodesNeeded > 0) {
    const { data: nonHighlightedResponse } = await strapiApi.getPosts({
      highlighted: 'exclude',
      filters: {
        type: {
          eq: 'Episode' as Enum_Post_Type,
        },
      },
      limit: episodesNeeded,
    })
    nonHighlightedEpisodes = nonHighlightedResponse.data
  }

  const initialEpisodes = [
    ...initialHighlightedEpisodes,
    ...nonHighlightedEpisodes,
  ]

  const { data: _shows = [] } = await strapiApi.getPodcastShows({})

  const shows = [...(_shows ?? [])].sort((a, b) => (a.title > b.title ? -1 : 1))

  const { data: tags = [] } = await strapiApi.getTopics()

  let calendarEvents: CalendarEvent[] = []
  let calendarError: string | null = null

  try {
    const calendarUrl = `${ADMIN_ACID_API_URL}${CALENDAR_PUBLIC_PATH}`
    const calendarResponse = await fetch(calendarUrl)

    const calendarData = (await calendarResponse.json()) as {
      success: boolean
      data?: CalendarEvent[]
    }

    if (calendarData.success && calendarData.data) {
      const allEvents = calendarData.data || []

      calendarEvents = Array.from(
        new Map(allEvents.map((event) => [event.id, event])).values(),
      )
    } else {
      calendarError = 'Failed to load calendar events. Please try again later.'
    }
  } catch (error) {
    logger.debug(
      {
        error,
        errorType: typeof error,
      },
      'Calendar events fetch failed in getStaticProps',
    )
    calendarError = 'Failed to load calendar events. Please try again later.'
  }

  // Generate the RSS feed
  try {
    const rssOutputPath = path.resolve(
      process.cwd(),
      'public',
      'rss',
      'main.xml',
    )

    // If the RSS feed is older than 24 hours, regenerate it
    const shouldRegenerateRss = await isFileOlderThan(rssOutputPath, DAY_MS)

    if (shouldRegenerateRss) {
      const rss = new LPERssFeed('main')
      await rss.init()

      const { data: allArticlesResponse } = await strapiApi.getPosts({
        skip: 0,
        limit: 1000,
        highlighted: 'include',
        parseContent: false,
        published: true,
        filters: {
          type: {
            eq: 'Article' as Enum_Post_Type,
          },
        },
      })
      const allArticles = allArticlesResponse.data || []

      allArticles.forEach((post) => rss.addPost(post))

      await rss.save()

      logger.info(`RSS feed generated with ${allArticles.length} articles`)
    } else {
      logger.info('RSS feed is fresh; skipping regeneration')
    }
  } catch (e) {
    logger.debug(
      {
        error: e,
        errorType: typeof e,
        articlesCount: initialArticles.length,
        feedType: 'main',
      },
      'RSS feed generation failed',
    )
    logger.error({ error: e }, 'Error generating RSS feed')
  }

  // Generate the sitemap
  try {
    const sitemapOutputPath = path.resolve(
      process.cwd(),
      'public',
      'sitemap.xml',
    )

    // If the sitemap is older than 24 hours, regenerate it
    const shouldRegenerateSitemap = await isFileOlderThan(
      sitemapOutputPath,
      DAY_MS,
    )

    if (shouldRegenerateSitemap) {
      const sitemapGenerator = new LPESitemapGenerator()
      await sitemapGenerator.generateSitemap()
    } else {
      logger.info('Sitemap is fresh; skipping regeneration')
    }
  } catch (e) {
    logger.debug(
      {
        error: e,
        errorType: typeof e,
      },
      'Sitemap generation failed',
    )
    logger.error({ error: e }, 'Error generating sitemap')
  }

  return {
    props: {
      data: {
        tags,
        shows,
        articles: initialArticles,
        episodes: initialEpisodes,
      },
      articlesMoreData: {
        remainingHighlighted: remainingHighlightedArticles,
        initialNonHighlightedCount: nonHighlightedArticles.length,
      },
      episodesMoreData: {
        remainingHighlighted: remainingHighlightedEpisodes,
        initialNonHighlightedCount: nonHighlightedEpisodes.length,
      },
      calendarEvents,
      calendarError,
    },
    revalidate: 10,
  }
}

export default Page
