import { LPE } from './lpe.types'

export enum PostTypes {
  Article = 'article',
  Block = 'block',
}

export type ApiResponse<T> = {
  data: T
  errors: any
}

export type ApiPaginatedPayload<T> = { data: T; hasMore: boolean }
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
  search: (
    query: string,
    tags: string[],
    docType: any, // TODO: @refactor UnbodyGraphQl.UnbodyDocumentTypeNames
  ) => Promise<void>
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
