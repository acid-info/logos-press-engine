import { useHydrated } from '@/hooks/useHydrated.util'
import { nope } from '@/utils/general.utils'
import { lsdUtils } from '@/utils/lsd.utils'
import { CloseIcon, IconButton, TabItem, Tabs } from '@acid-info/lsd-react'
import styled from '@emotion/styled'
import clsx from 'clsx'
import React, { useEffect, useRef, useState } from 'react'
import { useDeepCompareEffect } from 'react-use'
import { SearchBoxFilters, SearchBoxFiltersProps } from './SearchBoxFilters'
import { SearchBoxInput } from './SearchBoxInput'
import { SearchBoxResults } from './SearchBoxResults'

export type SearchBoxProps = Partial<React.ComponentProps<typeof Container>> &
  Pick<SearchBoxFiltersProps, 'filters'> & {
    view?: string
    views?: { key: string; label: string }[]
    query?: string
    title?: string
    fetching?: boolean
    numberOfResults?: number
    showCloseButton?: boolean
    showClearQueryButton?: boolean

    globalMode?: boolean

    onViewChange?: (view: string) => void
    onQueryChange?: (query: string) => void
    onFilterChange?: SearchBoxFiltersProps['onChange']
    onSearch?: () => void
    onClose?: () => void
    onClearQuery?: () => void
  }

export const SearchBox: React.FC<SearchBoxProps> = ({
  view,
  views,
  title,
  query = '',
  filters = [],
  fetching = false,
  numberOfResults,
  showCloseButton = false,
  showClearQueryButton = false,
  globalMode = true,
  onQueryChange = nope,
  onViewChange = nope,
  onFilterChange = nope,
  onSearch = nope,
  onClose = nope,
  onClearQuery = nope,
  ...props
}) => {
  const hydrated = useHydrated()

  const rootRef = useRef<HTMLDivElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  const [top, setTop] = useState(0)
  const [focused, setFocused] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [activeInput, setActiveInput] = useState(false)
  const stickyComponent = globalMode
    ? 'results'
    : query.length === 0 || !activeInput
    ? 'root'
    : 'results'

  const handleViewChange = async (n: string) => {
    onViewChange(n)
    onSearch()
  }

  useEffect(() => {
    if (!hydrated) return

    const rootElement = rootRef.current
    let stickyElement =
      stickyComponent === 'results' ? resultsRef.current : rootElement

    const navbarRect = document
      .querySelector('header > nav')
      ?.getBoundingClientRect()

    if (!stickyElement || !rootElement || !navbarRect) return

    const rootRect = rootElement.getBoundingClientRect()
    const rect = stickyElement.getBoundingClientRect()
    let top = navbarRect.height

    top -= rect.top - rootRect.top
    top += rootRect.bottom - rect.bottom

    setTop(top)
    setCollapsed(window.scrollY > rect.bottom + top)

    const onScroll = () => {
      setCollapsed(window.scrollY > rect.bottom + top)
    }

    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [resultsRef, hydrated, globalMode, stickyComponent])

  useDeepCompareEffect(() => {
    onSearch()
  }, [query, filters])

  return (
    <Container
      ref={rootRef}
      {...props}
      className={clsx(
        props.className,
        'search-box',
        activeInput && 'search-box--active',
        collapsed && 'search-box--collapsed',
        globalMode && 'search-box--global',
        `search-box--sticky-${stickyComponent}`,
      )}
      style={{ top: `${top}px`, ...(props.style || {}) }}
    >
      <div className="search-box__controls">
        <SearchBoxInput
          value={query}
          globalMode={globalMode}
          keepEnlarged={!globalMode}
          triggerOnBlur={!globalMode}
          showClearButton={showClearQueryButton}
          onChange={(value) => onQueryChange(value)}
          onFocusChange={(value) => setFocused(value)}
          onActive={(value) => setActiveInput(value)}
        />
        {views && views.length > 0 && (
          <ViewButtons>
            <Tabs size={'small'} activeTab={view} onChange={handleViewChange}>
              {views.map((view) => (
                <TabItem key={view.key} name={view.key}>
                  {view.label}
                </TabItem>
              ))}
            </Tabs>
          </ViewButtons>
        )}
        {showCloseButton && (
          <IconButton
            className="search-box__close-button"
            size="small"
            onClick={() => onClose()}
          >
            <CloseIcon color="primary" />
          </IconButton>
        )}
      </div>
      <SearchBoxFilters filters={filters} onChange={onFilterChange} />
      <SearchBoxResults
        title={title}
        query={query}
        filters={filters}
        fetching={fetching}
        showDetails={collapsed}
        numberOfResults={numberOfResults}
        containerRef={resultsRef}
      />
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-bottom: 1px solid rgba(var(--lsd-text-primary), 1);
  padding: 8px 14px;
  position: sticky;

  z-index: 1;
  background: rgba(var(--lsd-surface-primary), 1);

  ${({ theme }) => lsdUtils.breakpoint(theme, 'xs', 'exact')} {
    padding: 8px 0;
  }

  .search-box__controls {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  &:not(.search-box--global) {
    padding: 2px 0 2px 14px;

    .search-box-results {
      display: none;
    }

    &.search-box--active {
      padding: 8px 0px 8px 14px;

      .search-box-results {
        display: block;
      }
    }
  }

  .search-box__close-button {
    transition: 0.2s;
  }

  &.search-box--collapsed.search-box--sticky-results {
    .search-box-results {
      width: calc(100% - 32px) !important;
    }

    .search-box__close-button {
      transform: translateY(160%);
    }
  }
`

const ViewButtons = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  gap: 12px;
`
