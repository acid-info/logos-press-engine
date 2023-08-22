import { SEO } from '@/components/SEO'
import PodcastsContainer from '@/containers/PodcastsContainer'
import PodcastsLayout from '@/layouts/PodcastsLayout/Podcasts.layout'
import unbodyApi from '@/services/unbody/unbody.service'
import { GetStaticPropsContext } from 'next'
import { ReactNode } from 'react'
import { LPE } from '../../types/lpe.types'

type PodcastsProps = {
  shows: LPE.Podcast.Show[]
  highlightedEpisodes: LPE.Podcast.Document[]
  errors: string | null
}

const PodcastShowPage = ({
  shows,
  highlightedEpisodes,
  errors,
}: PodcastsProps) => {
  if (!shows) return null
  if (errors) return <div>{errors}</div>

  return (
    <>
      <SEO
        title={'Logos Podcasts'}
        description={'Description'}
        imageUrl={undefined}
        pagePath={`/podcasts`}
        tags={[]}
      />
      <PodcastsContainer
        shows={shows}
        highlightedEpisodes={highlightedEpisodes}
      />
    </>
  )
}

export const getStaticProps = async ({ params }: GetStaticPropsContext) => {
  // TODO : error handling
  const { data: podcastShows, errors: podcastShowsErrors } =
    await unbodyApi.getPodcastShows({ populateEpisodes: true })

  // TODO : error handling
  const { data: highlightedEpisodes, errors: highlightedEpisodesErrors } =
    await unbodyApi.getHighlightedEpisodes({})

  if (!podcastShows) {
    return {
      notFound: true,
      props: { why: 'no podcasts' },
    }
  }

  return {
    props: {
      shows: podcastShows,
      highlightedEpisodes,
      // errors,
    },
  }
}

PodcastShowPage.getLayout = function getLayout(page: ReactNode) {
  return <PodcastsLayout>{page}</PodcastsLayout>
}

export default PodcastShowPage
