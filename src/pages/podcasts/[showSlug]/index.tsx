import { SEO } from '@/components/SEO'
import PodcastShowContainer from '@/containers/Podcasts/PodcastShowContainer'
import { LPERssFeed } from '@/services/rss.service'
import { GetStaticPropsContext } from 'next'
import { useRouter } from 'next/router'
import { ReactNode } from 'react'
import { DefaultLayout } from '../../../layouts/DefaultLayout'
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

  const paths = data.map((show) => {
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
    return {
      notFound: true,
      props: { why: 'no slug' },
      revalidate: 10,
    }
  }

  // TODO : error handling
  const { data: shows, errors: podcastShowDataErrors } =
    await strapiApi.getPodcastShows({
      slug: showSlug as string,
    })

  // TODO : error handling
  const { data: latestEpisodes, errors: latestEpisodesErros } =
    await strapiApi.getLatestEpisodes({
      showSlug: showSlug as string,
      limit: 8,
    })

  // TODO : error handling
  const { data: highlightedEpisodes, errors: highlightedEpisodesErrors } =
    await strapiApi.getLatestEpisodes({
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
    await rss.init()
    latestEpisodes.data.forEach((post: LPE.Post.Document) => rss.addPost(post))
    await rss.save()
  } catch (e) {
    console.log('Error generating RSS feed', e)
  }

  return {
    props: {
      show: shows[0],
      latestEpisodes,
      highlightedEpisodes: highlightedEpisodes.data,
    },
    revalidate: 10,
  }
}

PodcastShowPage.getLayout = function getLayout(page: ReactNode) {
  return <DefaultLayout mainProps={{ spacing: false }}>{page}</DefaultLayout>
}

export default PodcastShowPage
