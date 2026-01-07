import { uiConfigs } from '@/configs/ui.configs'
import { SearchResultsExploreView } from '@/containers/Search/ExploreView'
import { SearchResultsListView } from '@/containers/Search/ListView'
import { LPE } from '@/types/lpe.types'
import { searchBlocksBasicFilter } from '@/utils/search.utils'
import { useInfiniteQuery } from '@tanstack/react-query'
import NextAdapterPages from 'next-query-params'
import { ReactNode, useMemo, useState } from 'react'
import { QueryParamProvider } from 'use-query-params'
import SEO from '../components/SEO/SEO'
import { GlobalSearchBox } from '../containers/GlobalSearchBox/GlobalSearchBox'
import { DefaultLayout } from '../layouts/DefaultLayout'
import { api } from '../services/api.service'
import { strapiApi } from '../services/strapi'

interface SearchPageProps {
  topics: string[]
  shows: LPE.Podcast.Show[]
}

const ITEMS_PER_PAGE = 15

export default function SearchPage({ topics, shows }: SearchPageProps) {
  const [view, setView] = useState<string>('list')

  const [query, setQuery] = useState<string>('')
  const [tags, setTags] = useState<string[]>([])
  const [types, setTypes] = useState<string[]>([])

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery(
      ['search', query, tags, types],
      ({ pageParam = 0 }) => {
        return api
          .search({
            query: query.length > 0 ? query : ' ',
            tags,
            type: types as LPE.ContentType[],
            limit: Math.floor(ITEMS_PER_PAGE),
            skip: Number.isInteger(pageParam) ? pageParam : 0,
          })
          .then((res) => {
            if (!res || res.errors || !res.data)
              return { posts: [], blocks: [], total: 0, hasMore: false }
            return {
              ...res.data,
              blocks: (res.data.blocks || []).filter((b) =>
                searchBlocksBasicFilter(
                  b as LPE.Search.ResultItemBase<LPE.Post.ContentBlock>,
                ),
              ),
              total: res.data.total || 0,
              hasMore: res.data.hasMore || false,
            }
          })
      },
      {
        getNextPageParam: (lastPage, allPages) => {
          return lastPage.hasMore ? allPages.length * ITEMS_PER_PAGE : undefined
        },
      },
    )

  const posts = useMemo(() => {
    return (data?.pages.flatMap((page) => page.posts) ||
      []) as LPE.Search.ResultItemBase<LPE.Post.Document>[]
  }, [data])

  const blocks = useMemo(() => {
    return (data?.pages.flatMap((page) => page.blocks) ||
      []) as LPE.Search.ResultItemBase<LPE.Post.ContentBlock>[]
  }, [data])

  const handleSearch = async (
    query: string,
    filteredTags: string[],
    filteredTypes: LPE.ContentType[],
  ) => {
    setQuery(query)
    setTags(filteredTags)
    setTypes(filteredTypes)
  }

  const total = data?.pages[0]?.total || 0

  let resultsNumber = total || posts.length || blocks.length

  return (
    <div style={{ minHeight: '80vh' }}>
      <SEO title="Search" pagePath={`/search`} />
      <GlobalSearchBox
        view={view}
        views={[]}
        tags={topics}
        onSearch={handleSearch}
        resultsNumber={resultsNumber}
        fetching={isLoading}
        onViewChange={setView}
      />
      {view === 'list' && (
        <SearchResultsListView
          blocks={blocks.slice(
            0,
            uiConfigs.searchResult.numberOfTotalBlocksInListView,
          )}
          posts={posts}
          shows={shows}
          busy={isLoading || isFetchingNextPage}
          showTopPost={query.length > 0}
          hasMore={hasNextPage}
          onLoadMore={fetchNextPage}
          selectedTypes={types}
        />
      )}
      {view === 'explore' && (
        <SearchResultsExploreView
          blocks={blocks as LPE.Search.ResultItemBase<LPE.Post.ContentBlock>[]}
          posts={posts as LPE.Search.ResultItemBase<LPE.Post.Document>[]}
          shows={shows}
        />
      )}
    </div>
  )
}

SearchPage.getLayout = (page: ReactNode) => (
  <QueryParamProvider adapter={NextAdapterPages}>
    <DefaultLayout
      mainProps={{
        spacing: false,
      }}
    >
      {page}
    </DefaultLayout>
  </QueryParamProvider>
)

export async function getStaticProps() {
  const { data: shows } = await strapiApi.getPodcastShows({})
  const { data: topics } = await strapiApi.getTopics()

  return {
    props: {
      shows,
      topics: topics.map((topic) => topic.name),
    },
    revalidate: 10,
  }
}
