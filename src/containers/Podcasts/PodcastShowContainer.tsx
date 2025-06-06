import { Grid, GridItem } from '@/components/Grid/Grid'
import PodcastShowCard from '@/components/Podcasts/PodcastShowCard'
import { Button } from '@acid-info/lsd-react'
import styled from '@emotion/styled'
import { PodcastSection } from '../../components/Podcasts/Podcast.Section'
import { useRecentEpisodes } from '../../queries/useRecentEpisodes.query'
import { ApiPaginatedPayload } from '../../types/data.types'
import { LPE } from '../../types/lpe.types'
import { lsdUtils } from '../../utils/lsd.utils'
import { FeaturedPostsGrid, SecondaryPostsGrid } from './Podcasts.styles'

interface Props {
  show: LPE.Podcast.Show
  latestEpisodes: ApiPaginatedPayload<LPE.Podcast.Document[]>
  highlightedEpisodes: LPE.Podcast.Document[]
}

const PodcastShowContainer = (props: Props) => {
  const { show } = props

  const query = useRecentEpisodes({
    limit: 8,
    showSlug: show.slug,
    initialData: props.latestEpisodes,
  })

  const highlightedPosts = [...props.highlightedEpisodes, ...query.posts].slice(
    0,
    2,
  )

  const latestPosts = query.posts.filter(
    (post) => !highlightedPosts.includes(post),
  )

  return (
    <>
      <PodcastsGrid>
        <PodcastsBodyContainer>
          <CustomPodcastShowCard show={show} />
          <PodcastSection title="Latest episodes">
            <FeaturedPostsGrid
              shows={[show]}
              posts={highlightedPosts}
              pattern={[
                {
                  cols: 2,
                  size: 'medium',
                },
              ]}
              breakpoints={[
                {
                  breakpoint: 'xs',
                  pattern: [
                    {
                      cols: 1,
                      size: 'small',
                    },
                  ],
                },
              ]}
            />
            <SecondaryPostsGrid
              shows={[show]}
              posts={latestPosts}
              pattern={[
                {
                  cols: 4,
                  size: 'small',
                },
              ]}
              breakpoints={[
                {
                  breakpoint: 'xs',
                  pattern: [{ cols: 1, size: 'small' }],
                },
                {
                  breakpoint: 'sm',
                  pattern: [{ cols: 4, size: 'small' }],
                },
              ]}
            />
          </PodcastSection>
        </PodcastsBodyContainer>
      </PodcastsGrid>
      {query.hasNextPage && (
        <SeeMoreButton onClick={() => query.fetchNextPage()}>
          See more episodes
        </SeeMoreButton>
      )}
    </>
  )
}

const PodcastsGrid = styled(Grid)`
  width: 100%;
`

const PodcastsBodyContainer = styled(GridItem)`
  grid-column: span 16;
`

const SeeMoreButton = styled(Button)`
  display: block;
  width: 236px;
  height: 40px;
  margin: 24px auto;
`

const CustomPodcastShowCard = styled(PodcastShowCard)`
  padding: 64px 0;

  ${(props) => lsdUtils.breakpoint(props.theme, 'xs', 'exact')} {
    padding: 48px 0;
  }
`

export default PodcastShowContainer
