import axios from 'axios'
import logger from '../lib/logger'
import { LPE } from '../types/lpe.types'

/**
 * Resolves a directly playable audio file for an episode that is only
 * distributed through channels the site cannot play itself.
 *
 * Apple Podcasts is the entry point because its URL carries the show id, and
 * the iTunes lookup API returns both the enclosure URL and the duration for
 * every episode of that show. Apple's own iframe embed
 * (embed.podcasts.apple.com) renders an empty placeholder, so resolving the
 * audio file is the only way to give these episodes a working player.
 */

const ITUNES_LOOKUP_URL = 'https://itunes.apple.com/lookup'
const EPISODE_LOOKUP_LIMIT = 200
const REQUEST_TIMEOUT_MS = 10_000

const APPLE_SHOW_ID_REGEX = /\/id(\d+)/
const APPLE_EPISODE_ID_PARAM = 'i'

type ItunesEpisode = {
  wrapperType?: string
  trackId?: number
  trackName?: string
  episodeUrl?: string
  trackTimeMillis?: number
}

// The lookup response is identical for every episode of a show, so one request
// per show is enough for a whole build.
const showEpisodesCache = new Map<string, Promise<ItunesEpisode[]>>()

const parseAppleUrl = (url: string) => {
  try {
    const parsed = new URL(url)
    const showId = parsed.pathname.match(APPLE_SHOW_ID_REGEX)?.[1]

    if (!showId) return null

    return {
      showId,
      episodeId: parsed.searchParams.get(APPLE_EPISODE_ID_PARAM),
    }
  } catch {
    return null
  }
}

const fetchShowEpisodes = (showId: string): Promise<ItunesEpisode[]> => {
  const cached = showEpisodesCache.get(showId)

  if (cached) return cached

  const request = axios
    .get(ITUNES_LOOKUP_URL, {
      params: {
        id: showId,
        entity: 'podcastEpisode',
        limit: EPISODE_LOOKUP_LIMIT,
      },
      timeout: REQUEST_TIMEOUT_MS,
    })
    .then((res) =>
      (res.data?.results ?? []).filter(
        (result: ItunesEpisode) => result.wrapperType === 'podcastEpisode',
      ),
    )
    .catch((error) => {
      logger.error('iTunes episode lookup failed', { showId, error })
      showEpisodesCache.delete(showId)
      return [] as ItunesEpisode[]
    })

  showEpisodesCache.set(showId, request)

  return request
}

const normalizeTitle = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

/**
 * Episode ids stored in the CMS are not always in sync with Apple, so the
 * title is the more reliable key. The feed title usually carries a show suffix
 * ("<episode> | Logos Podcast with ..."), hence the prefix comparison.
 */
const findEpisode = (
  episodes: ItunesEpisode[],
  episodeId: string | null,
  title: string,
) => {
  const byId =
    episodeId &&
    episodes.find((episode) => String(episode.trackId) === episodeId)

  if (byId) return byId

  const normalized = normalizeTitle(title)

  if (!normalized) return null

  return (
    episodes.find(
      (episode) => normalizeTitle(episode.trackName ?? '') === normalized,
    ) ??
    episodes.find((episode) =>
      normalizeTitle(episode.trackName ?? '').startsWith(normalized),
    ) ??
    null
  )
}

export const resolveAudioFromApplePodcasts = async (
  applePodcastsUrl: string,
  episodeTitle: string,
): Promise<LPE.Podcast.AudioChannelData | null> => {
  const parsed = parseAppleUrl(applePodcastsUrl)

  if (!parsed) {
    logger.error('Invalid Apple Podcasts URL', { url: applePodcastsUrl })
    return null
  }

  const episodes = await fetchShowEpisodes(parsed.showId)
  const episode = findEpisode(episodes, parsed.episodeId, episodeTitle)

  if (!episode?.episodeUrl) {
    logger.error('No audio file found for episode', {
      url: applePodcastsUrl,
      episodeTitle,
    })
    return null
  }

  return {
    audioFileUrl: episode.episodeUrl,
    duration: Math.round((episode.trackTimeMillis ?? 0) / 1000),
  }
}
