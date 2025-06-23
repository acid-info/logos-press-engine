import { useHydrated } from '@/hooks/useHydrated.util'
import { LPE } from '@/types/lpe.types'
import React from 'react'
import {
  ArrayParam,
  StringParam,
  useQueryParam,
  withDefault,
} from 'use-query-params'
import { SearchBox, SearchBoxProps } from '../../components/SearchBox/SearchBox'
import { nope } from '../../utils/general.utils'
import { formatTagText } from '../../utils/string.utils'
import { useIsMobile } from '../../utils/ui.utils'

import PostTypes = LPE.PostTypes
import ContentBlockTypes = LPE.Post.ContentBlockTypes

const ContentTypesCategories = {
  Post: 'post',
  Block: 'block',
} as const

const contentTypes = [
  {
    label: 'Articles',
    value: PostTypes.Article,
    category: ContentTypesCategories.Post,
  },
  {
    label: 'Podcasts',
    value: PostTypes.Podcast,
    category: ContentTypesCategories.Post,
  },
  // {
  //   label: 'Paragraphs',
  //   value: ContentBlockTypes.Text,
  //   category: ContentTypesCategories.Block,
  // },
  // {
  //   label: 'Images',
  //   value: ContentBlockTypes.Image,
  //   category: ContentTypesCategories.Block,
  // },
]

const allContentTypes = contentTypes.map((c) => c.value)

export type GlobalSearchBoxProps = Pick<
  SearchBoxProps,
  'view' | 'views' | 'onViewChange' | 'fetching'
> & {
  fetching?: boolean
  tags?: string[]
  resultsNumber: number | null
  onSearch?: (query: string, tags: string[], types: LPE.ContentType[]) => void
}

export const GlobalSearchBox: React.FC<GlobalSearchBoxProps> = ({
  fetching,
  tags = [],
  view,
  views,
  resultsNumber,
  onSearch = nope,
  onViewChange,
}) => {
  const hydrated = useHydrated()
  const isMobile = useIsMobile()

  const [filterTags, setFilterTags] = useQueryParam(
    'topic',
    withDefault(ArrayParam, []),
    {
      skipUpdateWhenNoChange: false,
    },
  )

  const [filterContentTypes, setFilterContentTypes] = useQueryParam(
    'type',
    withDefault(ArrayParam, allContentTypes),
    {
      skipUpdateWhenNoChange: true,
    },
  )

  const [query, setQuery] = useQueryParam('q', withDefault(StringParam, ''), {
    skipUpdateWhenNoChange: true,
  })

  return (
    <SearchBox
      query={!hydrated ? '' : query}
      fetching={fetching}
      onFilterChange={(key, value) => {
        setFilterContentTypes([])
        if (key === 'type') setFilterContentTypes(value)
        else setFilterTags(value)
      }}
      onQueryChange={(q) => setQuery(q)}
      onViewChange={onViewChange}
      numberOfResults={resultsNumber || 0}
      onSearch={() => {
        onSearch(
          query,
          filterTags as string[],
          filterContentTypes as LPE.ContentType[],
        )
      }}
      view={view}
      {...(isMobile ? {} : { views })}
      filters={[
        {
          key: 'type',
          label: 'Content Type',
          value: !hydrated ? [] : (filterContentTypes as string[]),
          defaultValue: allContentTypes,
          options: contentTypes.map((type) => ({
            label: type.label,
            value: type.value,
          })),
        },
        {
          key: 'topic',
          label: 'Topics',
          value: !hydrated ? [] : (filterTags as string[]),
          options: tags.map((tag) => ({
            label: formatTagText(tag),
            value: tag,
          })),
        },
      ]}
    />
  )
}
