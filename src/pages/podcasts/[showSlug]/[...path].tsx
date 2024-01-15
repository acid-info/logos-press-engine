import { SEO } from '@/components/SEO'
import EpisodeContainer from '@/containers/EpisodeContainer'
import { GetStaticPropsContext } from 'next'
import { LPE } from '../../../types/lpe.types'

import unbodyApi from '@/services/unbody/unbody.service'
import { getPostLink } from '../../../utils/route.utils'

type EpisodeProps = {
  episode: LPE.Podcast.Document
  relatedEpisodes: LPE.Podcast.Document[]
  errors: string | null
}

const EpisodePage = ({ episode, relatedEpisodes, errors }: EpisodeProps) => {
  if (!episode) return null
  if (errors) return <div>{errors}</div>

  return (
    <>
      <SEO
        title={episode.title}
        description={episode.description}
        noIndex={episode.isDraft}
        image={episode.coverImage}
        imageUrl={undefined}
        pagePath={getPostLink('podcast', {
          showSlug: episode.show?.slug as string,
          postSlug: episode.slug as string,
        })}
        date={episode.publishedAt}
        tags={[
          ...episode.tags,
          ...episode.authors.map((author) => author.name),
        ]}
        contentType={LPE.PostTypes.Podcast}
      />
      <EpisodeContainer episode={episode} relatedEpisodes={relatedEpisodes} />
    </>
  )
}

export async function getStaticPaths() {
  const { data } = await unbodyApi.getPodcastShows({ populateEpisodes: true })

  const paths = data.flatMap((show) => {
    return (
      show?.episodes &&
      show.episodes.map((episode) => {
        return {
          params: {
            showSlug: show.slug,
            path: [episode.slug],
          },
        }
      })
    )
  })

  return {
    paths: paths,
    fallback: 'blocking',
  }
}

export const getStaticProps = async ({ params }: GetStaticPropsContext) => {
  const { showSlug, path } = params!
  const [epSlug, idProp, id] = (Array.isArray(path) && path) || []

  if (idProp && (idProp !== 'id' || !id)) {
    return {
      notFound: true,
      props: {},
    }
  }

  if (!epSlug || !showSlug) {
    return {
      notFound: true,
      props: { why: 'no slug' },
    }
  }

  // TODO : error handling
  const { data: episode, errors: episodeErros } =
    await unbodyApi.getPodcastEpisode({
      showSlug: showSlug as string,
      slug: epSlug as string,
      textBlocks: true,
      ...(id
        ? {
            id: id as string,
            includeDraft: true,
          }
        : {}),
    })

  // TODO : error handlings
  const { data: relatedEpisodes, errors: relatedEpisodesErros } =
    await unbodyApi.getRelatedEpisodes({
      showSlug: showSlug as string,
      id: episode?.id as string,
    })

  if (!episode) {
    return {
      notFound: true,
      props: { why: 'no article' },
      revalidate: 10,
    }
  }

  return {
    props: {
      episode,
      relatedEpisodes,
    },
    revalidate: 10,
  }
}

export default EpisodePage
