import styled from '@emotion/styled'
import React, { useEffect, useState } from 'react'
import { SearchBox } from '../../components/SearchBox'
import { uiConfigs } from '../../configs/ui.configs'
import { usePostSearchQuery } from '../../queries/usePostSearch.query'
import { useNavbarState } from '../../states/navbarState'
import { useOnWindowResize } from '../../utils/ui.utils'
import { PostSearchContext } from './PostSearch.context'

export type PostSearchContainerProps = {
  postId?: string
  postTitle?: string
}

export const PostSearchContainer: React.FC<
  React.PropsWithChildren<PostSearchContainerProps>
> = ({ postId = '', postTitle, children, ...props }) => {
  const navbarState = useNavbarState()

  const [query, setQuery] = useState('')
  const [active, setActive] = useState(false)
  const [height, setHeight] = useState(
    typeof window === 'undefined' ? 0 : document.body.scrollHeight,
  )

  const res = usePostSearchQuery({
    id: postId,
    query,
    active: active && query.length > 0,
  })

  useEffect(() => {
    const onSearch = () => {
      setActive(true)
    }

    navbarState.setOnSearchCallback(onSearch)

    return () => {
      navbarState.setOnSearchCallback(null)
      navbarState.setShowSearchButton(true)
    }
  }, [])

  useEffect(() => {
    navbarState.setShowSearchButton(!active)
    if (!active) {
      setQuery('')
    }
  }, [active])

  useOnWindowResize(() => {
    setHeight(document.body.scrollHeight)
  })

  useEffect(() => {
    setHeight(document.body.scrollHeight)
    if (active && query.length > 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [active, query, res.data])

  return (
    <>
      <SearchBoxContainer active={active} height={height}>
        <SearchBox
          query={query}
          onClearQuery={() => setQuery('')}
          onClose={() => setActive(false)}
          onQueryChange={(q) => setQuery(q)}
          title={postTitle}
          showClearQueryButton
          globalMode={false}
          showCloseButton
          fetching={res.isLoading}
          numberOfResults={res.data?.length}
        />
      </SearchBoxContainer>
      <PostSearchContext.Provider
        value={{
          query,
          fetching: res.isLoading,
          active: active && query.length > 0,
          results: res.data || [],
        }}
      >
        {children}
      </PostSearchContext.Provider>
    </>
  )
}

const SearchBoxContainer = styled.div<{ active?: boolean; height?: number }>`
  position: absolute;
  height: ${(props) => props.height || 0}px;
  min-height: 100vh;
  width: calc(100% - 2 * var(--main-content-padding));
  max-width: ${uiConfigs.maxContainerWidth}px;
  top: ${uiConfigs.navbarRenderedHeight - 1}px;

  & > div {
    transform: translateY(${(props) => (props.active ? '0' : '-100%')});
    transition: 0.3s;
  }
`
