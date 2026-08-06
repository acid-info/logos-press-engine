import styled from '@emotion/styled'
import { PodcastEmbed } from '../../../utils/podcastEmbed.utils'

export type EpisodeEmbedPlayerProps = {
  embed: PodcastEmbed
}

/**
 * Renders a third-party podcast player (Spotify, Apple Podcasts) as an iframe.
 * These players are self-contained and are not wired into the global audio
 * player, since they expose no playback state to the embedding page.
 */
const EpisodeEmbedPlayer = ({ embed }: EpisodeEmbedPlayerProps) => (
  <EmbedContainer embedHeight={embed.height}>
    <iframe
      src={embed.src}
      title={embed.title}
      width="100%"
      height={embed.height}
      frameBorder="0"
      loading="lazy"
      allowFullScreen
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
    />
  </EmbedContainer>
)

const EmbedContainer = styled.div<{ embedHeight: number }>`
  width: 100%;
  height: ${(props) => props.embedHeight}px;

  iframe {
    display: block;
    border: 0;
    border-radius: 12px;
  }
`

export default EpisodeEmbedPlayer
