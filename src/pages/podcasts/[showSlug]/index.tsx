import { SEO } from '@/components/SEO'
import PodcastShowContainer from '@/containers/Podcasts/PodcastShowContainer'
import { LPERssFeed } from '@/services/rss.service'
import { GetStaticPropsContext } from 'next'
import { useRouter } from 'next/router'
import { ReactNode } from 'react'
import { DefaultLayout } from '../../../layouts/DefaultLayout'
import logger from '../../../lib/logger'
import { strapiApi } from '../../../services/strapi'
import { ApiPaginatedPayload } from '../../../types/data.types'
import { LPE } from '../../../types/lpe.types'
import { getPostLink } from '../../../utils/route.utils'

interface PodcastShowProps {
  show: LPE.Podcast.Show
  latestEpisodes: ApiPaginatedPayload<LPE.Podcast.Document[]>
  highlightedEpisodes: LPE.Podcast.Document[]
  errors: string | null
}

const PodcastShowPage = ({
  show,
  latestEpisodes,
  highlightedEpisodes,
  errors,
}: PodcastShowProps) => {
  const {
    query: { showSlug },
  } = useRouter()

  if (!show) return null
  if (errors) return <div>{errors}</div>

  return (
    <>
      <SEO
        title={show.title}
        description={show.descriptionText}
        imageUrl={undefined}
        pagePath={getPostLink('podcast', { showSlug: showSlug as string })}
        tags={[]}
        rssFileName={`${showSlug}.xml`}
      />
      <PodcastShowContainer
        show={show}
        latestEpisodes={latestEpisodes}
        highlightedEpisodes={highlightedEpisodes}
      />
    </>
  )
}

export async function getStaticPaths() {
  const { data } = await strapiApi.getPodcastShows({ populateEpisodes: false })

  const paths = (data || []).map((show) => {
    return {
      params: {
        showSlug: show.slug,
      },
    }
  })

  return {
    paths: paths,
    fallback: 'blocking',
  }
}

export const getStaticProps = async ({ params }: GetStaticPropsContext) => {
  const { showSlug } = params!

  if (!showSlug) {
    logger.warn(
      'Podcast show page requested without showSlug; returning notFound',
    )
    return {
      notFound: true,
      revalidate: 10,
    }
  }

  const { data: shows, errors } = await strapiApi.getPodcastShows({
    slug: showSlug as string,
  })

  if (!shows || shows.length === 0) {
    logger.warn(
      { showSlug },
      'Podcast show not found for slug; returning notFound',
    )
    return {
      notFound: true,
      revalidate: 10,
    }
  }

  const { data: latestEpisodes } = await strapiApi.getLatestEpisodes({
    showSlug: showSlug as string,
    limit: 8,
  })

  const { data: highlightedEpisodes } = await strapiApi.getLatestEpisodes({
    highlighted: 'only',
    limit: 2,
    showSlug: showSlug as string,
  })

  try {
    const rss = new LPERssFeed(showSlug as string, {
      title: shows[0].title,
      description: shows[0].descriptionText,
      image: shows[0].logo.url,
      language: 'en',
      id: shows[0].id ?? (showSlug as string),
      copyright: `All rights reserved ${new Date().getFullYear()}, ${
        shows[0].title
      }`,
    })
    rss.showSlug = showSlug as string
    await rss.init()

    // Try to get all episodes, fallback to latest episodes if API fails
    let showEpisodes: LPE.Post.Document[] = []

    try {
      const { data: allEpisodesResponse } = await strapiApi.getPosts({
        skip: 0,
        limit: 1000,
        highlighted: 'include',
        parseContent: false,
        published: true,
        filters: {
          type: {
            eq: 'Episode',
          },
        },
      })
      const allEpisodes = allEpisodesResponse?.data || []

      // Filter episodes for this specific show
      showEpisodes = allEpisodes.filter(
        (episode: LPE.Post.Document) => (episode as any).showId === shows[0].id,
      )
    } catch (apiError) {
      logger.warn(
        `API failed for ${showSlug}, using latest episodes:`,
        apiError,
      )
      // Fallback to latest episodes if API fails
      showEpisodes = latestEpisodes.data || []
    }

    showEpisodes.forEach((post: LPE.Post.Document) => rss.addPost(post))
    await rss.save()

    logger.info(
      `Podcast RSS feed generated for ${showSlug} with ${showEpisodes.length} episodes`,
    )
  } catch (e) {
    const showSlug = params?.showSlug
    logger.debug(
      {
        showSlug,
        error: e,
        errorType: typeof e,
        episodesCount: latestEpisodes.data.length,
        showTitle: shows[0]?.title,
        feedType: 'podcast',
      },
      'Podcast RSS feed generation failed',
    )
    logger.error(
      {
        showSlug,
        error: e,
      },
      'Error generating RSS feed for podcast',
    )
  }

  return {
    props: {
      show: shows[0],
      latestEpisodes: latestEpisodes || { data: [], hasMore: false },
      highlightedEpisodes: highlightedEpisodes?.data || [],
    },
    revalidate: 10,
  }
}

PodcastShowPage.getLayout = function getLayout(page: ReactNode) {
  return <DefaultLayout mainProps={{ spacing: false }}>{page}</DefaultLayout>
}

export default PodcastShowPage
