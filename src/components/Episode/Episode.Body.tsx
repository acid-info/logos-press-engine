import styled from '@emotion/styled'
import { useHookstate } from '@hookstate/core'
import { LPE } from '../../types/lpe.types'
import { lsdUtils } from '../../utils/lsd.utils'
import { isEmbeddableChannel } from '../../utils/podcastEmbed.utils'
import { playerState } from '../GlobalAudioPlayer/globalAudioPlayer.state'
import EpisodeTranscript from './Episode.Transcript'
import EpisodeFooter from './Footer/Episode.Footer'
import EpisodeHeader from './Header/Episode.Header'

interface Props {
  episode: LPE.Podcast.Document
  relatedEpisodes: LPE.Podcast.Document[]
}

export default function EpisodeBody({ episode, relatedEpisodes }: Props) {
  const youtube = episode?.channels.find(
    (channel) => channel?.name === LPE.Podcast.ChannelNames.Youtube,
  )
  const simplecast = episode?.channels.find(
    (channel) => channel?.name === LPE.Podcast.ChannelNames.Simplecast,
  )
  const spotify = episode?.channels.find(
    (channel) => channel?.name === LPE.Podcast.ChannelNames.Spotify,
  )
  const applePodcasts = episode?.channels.find(
    (channel) => channel?.name === LPE.Podcast.ChannelNames.ApplePodcasts,
  )

  // Fall back to a third-party embed when the episode has no natively playable
  // channel. Spotify is preferred over Apple Podcasts.
  const embeddable = [spotify, applePodcasts].find(isEmbeddableChannel)

  const channel = youtube ?? simplecast ?? embeddable ?? null

  const state = useHookstate(playerState)
  const duration = Math.round(state.value.duration / 60)

  return (
    <EpisodeContainer>
      <EpisodeHeader
        {...episode}
        duration={duration || 0}
        channel={channel || undefined}
      />
      <EpisodeTranscript episode={episode} />
      <EpisodeFooter episode={episode} relatedEpisodes={relatedEpisodes} />
    </EpisodeContainer>
  )
}

const EpisodeContainer = styled.article`
  display: flex;
  position: relative;
  flex-direction: column;
  max-width: 696px;

  ${(props) => lsdUtils.breakpoint(props.theme, 'xs', 'down')} {
    margin-top: 32px;
  }
`
