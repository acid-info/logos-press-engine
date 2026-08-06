import { LPE } from '../types/lpe.types'

export type PodcastEmbed = {
  src: string
  height: number
  title: string
}

const SPOTIFY_EMBED_HEIGHT = 152

const SPOTIFY_URL_REGEX =
  /^https?:\/\/open\.spotify\.com\/(?:intl-[a-z-]+\/)?(episode|show)\/([a-zA-Z0-9]+)/

const getSpotifyEmbed = (url: string): PodcastEmbed | null => {
  const match = url.match(SPOTIFY_URL_REGEX)

  if (!match) return null

  const [, type, id] = match

  return {
    src: `https://open.spotify.com/embed/${type}/${id}`,
    height: SPOTIFY_EMBED_HEIGHT,
    title: 'Spotify player',
  }
}

export const isEmbeddableChannel = (
  channel: LPE.Podcast.Channel | null | undefined,
): boolean => getPodcastEmbed(channel) !== null

/**
 * Apple Podcasts is deliberately not embeddable here: embed.podcasts.apple.com
 * renders an empty grey placeholder instead of a player, so an Apple-only
 * episode is better served by the channel link than by a broken embed.
 */
export const getPodcastEmbed = (
  channel: LPE.Podcast.Channel | null | undefined,
): PodcastEmbed | null => {
  if (!channel?.url) return null

  return channel.name === LPE.Podcast.ChannelNames.Spotify
    ? getSpotifyEmbed(channel.url)
    : null
}
