import axios, { AxiosInstance } from 'axios'
import { ApiResponse } from '../types/data.types'
import { LPE } from '../types/lpe.types'
import { settle } from '../utils/promise.utils'
import { getWebsiteUrl } from '../utils/route.utils'

const DEFAULT_ARTICLE_DISCUSSION_CATEGORY_ID = 8
const DISCOURSE_API_KEY = process.env.DISCOURSE_API_KEY || ''
const DISCOURSE_BASE_URL =
  process.env.DISCOURSE_BASE_URL || 'https://forum.logos.co'
const DISCOURSE_USERNAME = process.env.DISCOURSE_USERNAME || 'system'

export class DiscourseService {
  client: AxiosInstance

  constructor(
    private baseUrl: string,
    private apiKey: string,
    private username: string,
  ) {
    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        'Api-Key': apiKey,
        'Api-Username': username,
        'Content-Type': 'application/json',
      },
    })
  }

  get forumBaseUrl(): string {
    return this.baseUrl
  }

  private handleResponse = <T>(
    data: T | null = null,
    errors: any = null,
  ): ApiResponse<T> => {
    if (errors) {
      const status = errors?.response?.status || 500
      const errorMessage =
        errors?.response?.data?.message || errors?.message || 'Unknown error'

      return {
        data: data as any,
        errors: errorMessage,
        status,
      }
    }

    if (!data) {
      return {
        data: data as any,
        errors: 'No data received',
        status: 404,
      }
    }

    return {
      data,
      errors: null,
      status: 200,
    }
  }

  private handleRequest = async <T = any>(
    handler: () => T | Promise<T>,
    defaultValue?: T,
  ): Promise<ApiResponse<T>> => {
    const [res, err] = await settle<T>(handler)
    return this.handleResponse(err ? defaultValue || null : res, err)
  }

  getTopic = async (
    topicId: number,
  ): Promise<ApiResponse<LPE.Discourse.TopicResponse>> =>
    this.handleRequest(async () => {
      const response = await this.client.get(`/t/${topicId}.json`)
      return response.data
    })

  createTopic = async (
    topicData: LPE.Discourse.CreateTopicRequest,
  ): Promise<ApiResponse<LPE.Discourse.CreateTopicResponse>> =>
    this.handleRequest(async () => {
      const response = await this.client.post('/posts.json', topicData)
      return response.data
    })

  getTopicUrl = (topicSlug: string, topicId: number): string =>
    `${this.baseUrl}/t/${topicSlug}/${topicId}`

  createArticleTopic = async (
    article: LPE.Article.Data,
    categoryId: number = DEFAULT_ARTICLE_DISCUSSION_CATEGORY_ID,
  ): Promise<ApiResponse<LPE.Discourse.CreateTopicResponse>> => {
    const topicData: LPE.Discourse.CreateTopicRequest = {
      title: `${article.title}`,
      raw: `This is a discussion topic for the article: **${
        article.title
      }**\n\n${
        article.summary
      }\n\n[Read the full article](${getWebsiteUrl()}/article/${article.slug})`,
      category: categoryId,
      archetype: 'regular',
    }

    return this.createTopic(topicData)
  }
}

export const discourseApi = new DiscourseService(
  DISCOURSE_BASE_URL,
  DISCOURSE_API_KEY,
  DISCOURSE_USERNAME,
)
