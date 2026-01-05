import { uiConfigs } from '@/configs/ui.configs'
import { SearchResultsExploreView } from '@/containers/Search/ExploreView'
import { SearchResultsListView } from '@/containers/Search/ListView'
import { LPE } from '@/types/lpe.types'
import { searchBlocksBasicFilter } from '@/utils/search.utils'
import { useQuery } from '@tanstack/react-query'
import NextAdapterPages from 'next-query-params'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import { QueryParamProvider } from 'use-query-params'
import SEO from '../components/SEO/SEO'
import { GlobalSearchBox } from '../containers/GlobalSearchBox/GlobalSearchBox'
import { DefaultLayout } from '../layouts/DefaultLayout'
import { api } from '../services/api.service'
import { strapiApi } from '../services/strapi'

interface SearchPageProps {
  topics: string[]
  shows: LPE.Podcast.Show[]
  // articles: SearchResultItem<LPE.Article.Data>[]
  // blocks: SearchResultItem<LPE.Article.ContentBlock>[]
}

const ITEMS_PER_PAGE = 15
const LIMIT = 100 // Maximum number of items to fetch from the API
const DEFAULT_SKIP = 0

export default function SearchPage({ topics, shows }: SearchPageProps) {
  const [view, setView] = useState<string>('list')

  const [query, setQuery] = useState<string>('')
  const [tags, setTags] = useState<string[]>([])
  const [types, setTypes] = useState<string[]>([])
  const [displayedCount, setDisplayedCount] = useState<number>(ITEMS_PER_PAGE)

  const { data, isLoading } = useQuery(['search', query, tags, types], () => {
    return api
      .search({
        query: query.length > 0 ? query : ' ',
        tags,
        type: types as LPE.ContentType[],
        limit: LIMIT,
        skip: DEFAULT_SKIP,
      })
      .then((res) => {
        if (!res) return
        if (res.errors) return
        if (!res.data) return
        return {
          ...res.data,
          blocks: res.data.blocks.filter((b) =>
            searchBlocksBasicFilter(
              b as LPE.Search.ResultItemBase<LPE.Post.ContentBlock>,
            ),
          ),
        }
      })
  })

  const blocks = (data?.blocks ||
    []) as LPE.Search.ResultItemBase<LPE.Post.ContentBlock>[]
  const posts = (data?.posts ||
    []) as LPE.Search.ResultItemBase<LPE.Post.Document>[]

  // Reset displayed count when search changes
  useEffect(() => {
    setDisplayedCount(ITEMS_PER_PAGE)
  }, [query, tags, types])

  const displayedPosts = useMemo(() => {
    return posts.slice(0, displayedCount)
  }, [posts, displayedCount])

  const hasMore = posts.length > displayedCount

  const handleLoadMore = () => {
    setDisplayedCount((prev) => prev + ITEMS_PER_PAGE)
  }

  const handleSearch = async (
    query: string,
    filteredTags: string[],
    filteredTypes: LPE.ContentType[],
  ) => {
    setQuery(query)
    setTags(filteredTags)
    setTypes(filteredTypes)
  }

  let resultsNumber =
    types.includes(LPE.ContentTypes.Article) ||
    types.includes(LPE.ContentTypes.Podcast)
      ? posts.length
      : blocks.length

  return (
    <div style={{ minHeight: '80vh' }}>
      <SEO title="Search" pagePath={`/search`} />
      <GlobalSearchBox
        view={view}
        views={
          [
            // { key: 'list', label: copyConfigs.search.views.default },
            // { key: 'explore', label: copyConfigs.search.views.explore },
          ]
        }
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
          posts={displayedPosts}
          shows={shows}
          busy={isLoading}
          showTopPost={query.length > 0}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
          selectedTypes={types}
        />
      )}
      {view === 'explore' && (
        <SearchResultsExploreView blocks={blocks} posts={posts} shows={shows} />
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
