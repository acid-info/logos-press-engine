import styled from '@emotion/styled'
import { useMemo } from 'react'
import { LPE } from '../../../types/lpe.types'
import { lsdUtils } from '../../../utils/lsd.utils'
import EpisodeCredits from './Episode.Credits'
import EpisodeFootnotes from './Episode.Footnotes'
import RelatedEpisodes from './Episode.RelatedEpisodes'

type Props = {
  episode: LPE.Podcast.Document
  relatedEpisodes: LPE.Podcast.Document[]
}

const EpisodeFooter = ({ episode, relatedEpisodes }: Props) => {
  const footnotes = useMemo(() => {
    return (
      episode.content &&
      episode.content
        .map((b) => (b as LPE.Post.TextBlock).footnotes || [])
        .flat()
    )
  }, [episode])

  return (
    <EpisodeFooterContainer>
      {!!episode?.credits && <EpisodeCredits credits={episode.credits} />}
      {!!footnotes && <EpisodeFootnotes footnotes={footnotes} />}
      {!!relatedEpisodes && relatedEpisodes.length > 0 && (
        <RelatedEpisodes
          podcastSlug={episode.show?.slug as string}
          relatedEpisodes={relatedEpisodes}
        />
      )}
    </EpisodeFooterContainer>
  )
}

const EpisodeFooterContainer = styled.div`
  margin-top: 56px;

  & > div:not(:first-of-type) > div > button,
  & > div:not(:first-of-type) > div {
    border-top: none;
  }

  ${(props) => lsdUtils.breakpoint(props.theme, 'xs', 'down')} {
    margin-top: 72px;
  }
`

export default EpisodeFooter
