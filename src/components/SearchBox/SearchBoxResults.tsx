import { copyConfigs } from '@/configs/copy.configs'
import { Typography } from '@acid-info/lsd-react'
import styled from '@emotion/styled'
import clsx from 'clsx'
import React from 'react'
import { useIsMobile } from '../../utils/ui.utils'
import { DotIcon } from '../Icons/DotIcon'
import { SearchBoxProps } from './SearchBox'

export type SearchBoxResultsProps = Partial<
  Omit<React.ComponentProps<typeof Container>, 'title'>
> &
  Pick<SearchBoxProps, 'filters'> & {
    title?: string
    query?: string
    fetching?: boolean
    showDetails?: boolean
    numberOfResults?: number
    containerRef?: React.LegacyRef<HTMLDivElement>
  }

export const SearchBoxResults: React.FC<SearchBoxResultsProps> = ({
  title,
  query,
  filters,
  fetching,
  numberOfResults,
  showDetails = false,
  containerRef,
  ...props
}) => {
  const isMobile = useIsMobile()

  const content = fetching ? (
    <Typography variant="subtitle2">Searching...</Typography>
  ) : (
    <>
      {typeof numberOfResults === 'number' && (
        <>
          <Typography variant={'subtitle2'}>
            {numberOfResults === 0
              ? copyConfigs.search.results.noResults
              : `${numberOfResults} ${copyConfigs.search.results.results}`}
          </Typography>
        </>
      )}
      {title && !isMobile && (
        <>
          <Typography
            component="span"
            variant="subtitle2"
            className="search-box-results__title"
          >
            {title}
          </Typography>
        </>
      )}
      {query && query.length > 0 && (
        <>
          <span className="dot ">
            <DotIcon className="search-box-results__details" color="primary" />
          </span>
          <Typography
            component="span"
            variant="subtitle2"
            className="search-box-results__details"
          >
            {query}
          </Typography>
        </>
      )}
      {filters &&
        filters.length > 0 &&
        filters
          .filter((f) => f.value.length > 0)
          .map((filter) => (
            <React.Fragment key={filter.key}>
              <span className="dot ">
                <DotIcon
                  className="search-box-results__details"
                  color="primary"
                />
              </span>
              {filter.value.map((filterTag, index) => (
                <Typography
                  key={index}
                  component="span"
                  variant="subtitle2"
                  className="search-box-results__details"
                >
                  [{filterTag}]
                </Typography>
              ))}
            </React.Fragment>
          ))}
    </>
  )

  return (
    <Container
      {...props}
      ref={containerRef}
      className={clsx(
        props.className,
        'search-box-results',
        showDetails && 'search-box-results--show-details',
      )}
    >
      {content}
    </Container>
  )
}

const Container = styled.div`
  &.search-box-results {
    width: 100%;
    display: block;
    overflow: hidden;
    white-space: nowrap;
  }

  .dot {
    margin: 0 8px;

    > * {
      vertical-align: middle;
    }
  }

  .search-box-results__details {
    opacity: 0;
    display: inline-block;
    transform: translateY(-40px);
    transition: all 0.2s ease-in-out;
  }

  &.search-box-results--show-details {
    .search-box-results__details {
      opacity: 1;
      transform: translateY(0);
    }
  }
`
