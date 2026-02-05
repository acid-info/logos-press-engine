import ArticleBody from '@/components/Article/Article.Body'
import { Grid, GridItem } from '@/components/Grid/Grid'
import { ArticleContainerContext } from '@/containers/ArticleContainer.Context'
import { css } from '@emotion/react'
import styled from '@emotion/styled'
import { useState } from 'react'
import { TableOfContents } from '../components/TableOfContents'
import { LPE } from '../types/lpe.types'
import { lsdUtils } from '../utils/lsd.utils'
import { PostSearchContainer } from './PostSearchContainer'
import { PostSearchContext } from './PostSearchContainer/PostSearch.context'

interface Props {
  data: LPE.Article.Document
}

const ArticleContainer = (props: Props) => {
  const { data } = props
  const [tocId, setTocId] = useState<string | null>(null)

  return (
    <PostSearchContainer
      postId={data.data.uuid}
      postTitle={data.data.title}
      blocks={props.data.data.content}
    >
      <PostSearchContext.Consumer>
        {(search) => {
          const displaySearchResults = search.active && !search.isInitialLoading

          return (
            <ArticleContainerContext.Provider
              value={{
                tocId,
                setTocId,
                articleData: data.data,
              }}
            >
              {data.data.htmlDocument ? (
                <FullWidthBody>
                  <ArticleBody
                    data={data}
                    header={!displaySearchResults}
                    footer={!displaySearchResults}
                  />
                </FullWidthBody>
              ) : (
                <ArticleGrid
                  searchMode={search.active}
                  displaySearchResults={displaySearchResults}
                  isSearching={search.fetching}
                >
                  <ArticleTocContainer className={'w-3'}>
                    {!displaySearchResults && (
                      <TableOfContents contents={data.data.toc ?? []} />
                    )}
                  </ArticleTocContainer>
                  <Gap className={'w-1'} />
                  <ArticleBodyContainer className={'w-8'}>
                    <ArticleBody
                      data={data}
                      header={!displaySearchResults}
                      footer={!displaySearchResults}
                    />
                  </ArticleBodyContainer>
                </ArticleGrid>
              )}
            </ArticleContainerContext.Provider>
          )
        }}
      </PostSearchContext.Consumer>
    </PostSearchContainer>
  )
}

const ArticleGrid = styled(Grid)<{
  searchMode?: boolean
  isSearching?: boolean
  displaySearchResults?: boolean
}>`
  width: 100%;

  ${(props) =>
    props.searchMode &&
    css`
      ${props.displaySearchResults &&
      css`
        padding-top: 90px;
        min-height: 100vh;
      `}

      ${props.isSearching &&
      css`
        filter: blur(2px);
        pointer-events: none;
      `}
    `}
`

const ArticleBodyContainer = styled(GridItem)`
  ${(props) => lsdUtils.breakpoint(props.theme, 'sm', 'between', 'lg')} {
    grid-column: span 10 !important;
  }
`

const ArticleTocContainer = styled(GridItem)`
  ${(props) => lsdUtils.breakpoint(props.theme, 'sm', 'between', 'lg')} {
    grid-column: span 4 !important;
  }
`

const Gap = styled(GridItem)`
  ${(props) => lsdUtils.breakpoint(props.theme, 'xs', 'down')} {
    display: none;
  }
`

const FullWidthBody = styled.div`
  width: 100vw;
  max-width: 100vw;
  margin-left: calc(50% - 50vw);
  margin-right: calc(50% - 50vw);
  padding: 0;
`

export default ArticleContainer
