import { SEO } from '@/components/SEO'
import PodcastsContainer from '@/containers/Podcasts/PodcastsContainer'
import { GetStaticPropsContext } from 'next'
import { ReactNode } from 'react'
import { DefaultLayout } from '../../layouts/DefaultLayout'
import { strapiApi } from '../../services/strapi'
import { LPE } from '../../types/lpe.types'
import { getPostLink } from '../../utils/route.utils'

type PodcastsProps = {
  shows: LPE.Podcast.Show[]
  latestEpisodes: LPE.Podcast.Document[]
  highlightedEpisodes: LPE.Podcast.Document[]
  errors: string | null
}

const PodcastShowPage = ({
  shows,
  latestEpisodes,
  highlightedEpisodes,
  errors,
}: PodcastsProps) => {
  if (!shows) return null
  if (errors) return <div>{errors}</div>

  return (
    <>
      <SEO
        title="Logos Podcasts"
        imageUrl={undefined}
        pagePath={getPostLink('podcast')}
        tags={[]}
      />
      <PodcastsContainer
        shows={shows}
        latestEpisodes={latestEpisodes}
        highlightedEpisodes={highlightedEpisodes}
      />
    </>
  )
}

export const getStaticProps = async ({ params }: GetStaticPropsContext) => {
  // TODO : error handling
  const { data: podcastShows, errors: podcastShowsErrors } =
    await strapiApi.getPodcastShows({
      populateEpisodes: true,
      episodesLimit: 6,
    })

  // TODO : error handling
  const { data: highlightedEpisodes, errors: highlightedEpisodesErrors } =
    await strapiApi.getLatestEpisodes({ highlighted: 'only' })

  const { data: latestEpisodes } = await strapiApi.getLatestEpisodes({
    limit: 10,
    highlighted: 'exclude',
  })

  if (!podcastShows) {
    return {
      notFound: true,
      props: { why: 'no podcasts' },
    }
  }

  return {
    props: {
      shows: podcastShows.sort((a, b) => (a.title > b.title ? -1 : 1)),
      latestEpisodes: latestEpisodes.data,
      highlightedEpisodes: highlightedEpisodes.data,
      // errors,
    },
    revalidate: 10,
  }
}

PodcastShowPage.getLayout = function getLayout(page: ReactNode) {
  return <DefaultLayout mainProps={{ spacing: false }}>{page}</DefaultLayout>
}

export default PodcastShowPage
