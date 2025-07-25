import logger from '../lib/logger'
import { ApiPaginatedResponse, ApiResponse } from '../types/data.types'
import { LPE } from '../types/lpe.types'

export class ApiService {
  getRecentPosts = async ({
    skip = 0,
    limit = 10,
  }: {
    skip?: number
    limit?: number
  }): Promise<ApiPaginatedResponse<LPE.Post.Document[]>> =>
    fetch(`/api/posts?skip=${skip}&limit=${limit}`)
      .then((res) => res.json())
      .catch((e) => {
        logger.debug('API fetch posts failed', {
          skip,
          limit,
          error: e,
          errorType: typeof e,
          url: `/api/posts?skip=${skip}&limit=${limit}`,
        })
        logger.error('Failed to fetch strapi posts', { error: e })
        return { data: [], errors: JSON.stringify(e) }
      })

  getLatestEpisodes = async ({
    skip = 0,
    limit = 10,
    showSlug,
  }: {
    skip?: number
    limit?: number
    showSlug: string
  }): Promise<ApiPaginatedResponse<LPE.Podcast.Document[]>> =>
    fetch(`/api/podcasts/${showSlug}/episodes?skip=${skip}&limit=${limit}`)
      .then((res) => res.json())
      .catch((e) => {
        logger.debug('API fetch podcast episodes failed', {
          showSlug,
          skip,
          limit,
          error: e,
          errorType: typeof e,
          url: `/api/podcasts/${showSlug}/episodes?skip=${skip}&limit=${limit}`,
        })
        logger.error('Failed to fetch strapi podcast episodes', { error: e })
        return { data: [], errors: JSON.stringify(e) }
      })

  search = async ({
    query = '',
    tags = [],
    type = [],
    limit = 50,
    skip = 0,
  }: {
    query?: string
    tags?: string[]
    limit?: number
    skip?: number
    type?: LPE.ContentType[]
  }): Promise<ApiResponse<LPE.Search.Result>> =>
    fetch(
      `/api/search?skip=${skip}&limit=${limit}&q=${query}&tags=${tags.join(
        ',',
      )}&type=${type.join(',')}`,
    )
      .then((res) => res.json())
      .catch((e) => {
        logger.debug('API search failed', {
          skip,
          limit,
          query,
          tags,
          type,
          error: e,
          errorType: typeof e,
          url: `/api/search?skip=${skip}&limit=${limit}&q=${query}&tags=${tags.join(
            ',',
          )}&type=${type.join(',')}`,
        })
        logger.error('Failed to search strapi', { error: e })
        return { data: { posts: [], blocks: [] }, errors: JSON.stringify(e) }
      })

  searchPostBlocks = async ({
    id,
    query = '',
    tags = [],
    limit = 50,
    skip = 0,
  }: {
    id: string
    query?: string
    tags?: string[]
    limit?: number
    skip?: number
  }): Promise<
    ApiResponse<{
      blocks: {
        index: number
        score: number
      }[]
    }>
  > =>
    fetch(`/api/search/post/${id}?q=${query}`)
      .then((res) => res.json())
      .catch((e) => {
        logger.debug('API search post blocks failed', {
          id,
          query,
          error: e,
          errorType: typeof e,
          url: `/api/search/post/${id}?q=${query}`,
        })
        logger.error('Failed to search strapi post blocks', { error: e })
        return { data: { blocks: [], posts: [] }, errors: JSON.stringify(e) }
      })

  subscribeToMailingList = async (payload: {
    email: string
    name?: string
  }): Promise<{
    result: {
      message: string
    }
  }> => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_ODOO_BASE_URL}/website_mass_mailing/subscribe2`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'call',
          params: {
            value: payload.email,
            name: payload.name || '',
            list_id: process.env.NEXT_PUBLIC_ODOO_MAILING_LIST_ID,
            subscription_type: 'email',
          },
        }),
      },
    )

    return res.json()
  }
}

export const api = new ApiService()
