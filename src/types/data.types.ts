import { LPE } from './lpe.types'

export enum PostTypes {
  Article = 'article',
  Block = 'block',
}

export interface ApiError {
  message: string
  code?: string | number
  details?: any
}

export type ApiResponse<T> = {
  data: T
  errors: ApiError | string | null
  status?: number
}

export type ApiPaginatedPayload<T> = {
  data: T
  hasMore: boolean
}

export type ApiPaginatedResponse<T> = ApiResponse<ApiPaginatedPayload<T>>

export type SearchResultItem<T> = {
  doc: T
  score: number
}

export type GlobalSearchResponse = {
  posts: LPE.Article.Data[]
  blocks: Array<SearchResultItem<LPE.Article.ContentBlock>>
}

export type SearchHookDataPayload = {
  articles: SearchResultItem<LPE.Article.Data>[]
  blocks: SearchResultItem<LPE.Article.ContentBlock>[]
}

export type SearchResults = {
  articles: SearchHook<LPE.Article.ContentBlock>
  blocks: SearchHook<LPE.Article.ContentBlock>
  search: (query: string, tags: string[], docType: any) => Promise<void>
  reset: (initialData: SearchHookDataPayload) => void
}

export type SearchResultsItemTypes =
  | SearchResultItem<LPE.Article.Data>
  | SearchResultItem<LPE.Article.ContentBlock>

export type SearchHook<T> = {
  data: SearchResultItem<T>[]
  loading: boolean
  error: string | null
  search: (
    query: string,
    tags: string[],
    ...args: any
  ) => Promise<SearchResultItem<T>[]>
  reset: (initialData: SearchResultItem<T>[]) => void
}

export interface SpacesCalendarEvent {
  id: number
  date: string
  type: string
  guest: string
  speakers: string[]
  topic: string | null
  notes: string | null
  links?: string[]
  totalConcurrentListeners: number | null
  totalPlaysDuringOrganic: number | null
  totalReplaysAll: number | null
  percentTotalPlaysOrganic: number | null
}

export interface SpacesCalendarResponse {
  success: boolean
  data: SpacesCalendarEvent[]
}
