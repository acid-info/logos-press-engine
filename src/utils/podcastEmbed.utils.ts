import { LPE } from '../types/lpe.types'

export type PodcastEmbed = {
  src: string
  height: number
  title: string
}

const SPOTIFY_EMBED_HEIGHT = 152
const APPLE_PODCASTS_EMBED_HEIGHT = 175

const SPOTIFY_URL_REGEX =
  /^https?:\/\/open\.spotify\.com\/(?:intl-[a-z-]+\/)?(episode|show)\/([a-zA-Z0-9]+)/

const APPLE_PODCASTS_HOST = 'podcasts.apple.com'
const APPLE_PODCASTS_EMBED_HOST = 'embed.podcasts.apple.com'

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

const getApplePodcastsEmbed = (url: string): PodcastEmbed | null => {
  try {
    const parsed = new URL(url)

    if (parsed.hostname !== APPLE_PODCASTS_HOST) return null

    parsed.hostname = APPLE_PODCASTS_EMBED_HOST

    return {
      src: parsed.toString(),
      height: APPLE_PODCASTS_EMBED_HEIGHT,
      title: 'Apple Podcasts player',
    }
  } catch {
    return null
  }
}

export const isEmbeddableChannel = (
  channel: LPE.Podcast.Channel | null | undefined,
): boolean => getPodcastEmbed(channel) !== null

export const getPodcastEmbed = (
  channel: LPE.Podcast.Channel | null | undefined,
): PodcastEmbed | null => {
  if (!channel?.url) return null

  switch (channel.name) {
    case LPE.Podcast.ChannelNames.Spotify:
      return getSpotifyEmbed(channel.url)
    case LPE.Podcast.ChannelNames.ApplePodcasts:
      return getApplePodcastsEmbed(channel.url)
    default:
      return null
  }
}
