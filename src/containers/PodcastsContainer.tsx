import { Grid, GridItem } from '@/components/Grid/Grid'
import PodcastsLists from '@/components/Podcasts/Podcasts.Lists'
import styled from '@emotion/styled'
import { PodcastSection } from '../components/Podcasts/Podcast.Section'
import { PostsGrid } from '../components/PostsGrid'
import { LPE } from '../types/lpe.types'
import { lsdUtils } from '../utils/lsd.utils'

interface Props {
  shows: LPE.Podcast.Show[]
  latestEpisodes: LPE.Podcast.Document[]
  highlightedEpisodes: LPE.Podcast.Document[]
}

const PodcastsContainer = (props: Props) => {
  const { shows, highlightedEpisodes, latestEpisodes } = props

  const requiredHighlightPostsCount = 2
  const gapCount = requiredHighlightPostsCount - highlightedEpisodes.length

  // Spread the existing highlighted episodes and fill the rest with the latest episodes
  const highlightPosts = [
    ...highlightedEpisodes,
    ...latestEpisodes.slice(0, gapCount),
  ]

  // Now we need to remove the highlight posts from the latest episodes
  const latestPosts = latestEpisodes.filter(
    (episode) => !highlightPosts.includes(episode),
  )

  return (
    <PodcastsGrid>
      <PodcastsBodyContainer className={'w-16'}>
        <PodcastsLists shows={shows} />

        <Episodes>
          <PodcastSection title="Latest episodes">
            <PostsGrid
              posts={highlightPosts}
              shows={shows}
              pattern={[{ cols: 2, size: 'medium' }]}
              breakpoints={[
                {
                  breakpoint: 'xs',
                  pattern: [{ cols: 1, size: 'small' }],
                },
                {
                  breakpoint: 'sm',
                  pattern: [{ cols: 2, size: 'small' }],
                },
              ]}
            />
            <PostsGrid
              shows={shows}
              bordered={false}
              posts={latestPosts.slice(0, 4)}
              pattern={[{ cols: 4, size: 'small' }]}
              breakpoints={[
                {
                  breakpoint: 'xs',
                  pattern: [{ cols: 1, size: 'small' }],
                },
                {
                  breakpoint: 'sm',
                  pattern: [{ cols: 2, size: 'small' }],
                },
              ]}
            />
          </PodcastSection>
        </Episodes>
      </PodcastsBodyContainer>
    </PodcastsGrid>
  )
}

const PodcastsBodyContainer = styled(GridItem)``

const PodcastsGrid = styled(Grid)`
  width: 100%;
  padding-top: 64px;

  ${(props) => lsdUtils.breakpoint(props.theme, 'xs', 'exact')} {
    padding-top: 24px;
  }
`

const Episodes = styled.div`
  margin-top: var(--lsd-spacing-64);

  ${(props) => lsdUtils.breakpoint(props.theme, 'xs', 'exact')} {
    margin-top: 56px;
  }
`

export default PodcastsContainer
