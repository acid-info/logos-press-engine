import { Dropdown, Typography } from '@acid-info/lsd-react'
import styled from '@emotion/styled'
import clsx from 'clsx'
import React, { useEffect, useState } from 'react'
import { nope } from '../../utils/general.utils'
import { lsdUtils } from '../../utils/lsd.utils'

export type SearchBoxFiltersProps = Partial<
  Omit<React.ComponentProps<typeof Container>, 'title' | 'onChange'>
> & {
  filters?: {
    key: string
    label: string
    value: string[]
    defaultValue?: string[]
    options?: {
      label: string
      value: string
    }[]
  }[]

  onChange?: (key: string, value: string[]) => void
  containerRef?: React.LegacyRef<HTMLDivElement>
}

export const SearchBoxFilters: React.FC<SearchBoxFiltersProps> = ({
  filters = [],
  containerRef,
  onChange = nope,
  ...props
}) => {
  const [showClear, setShowClear] = useState(false)

  useEffect(() => {
    const showClear = filters.some((f) =>
      !f.defaultValue
        ? f.value.length > 0
        : f.value.length < (f.defaultValue || []).length,
    )
    setShowClear(showClear)
  }, [filters])

  const handleClear = () => {
    for (const filter of filters) {
      setTimeout(() => {
        onChange(filter.key, filter.defaultValue ?? [])
      }, 0)
    }
  }

  if (!filters || filters.length === 0) return null

  return (
    <Container
      {...props}
      ref={containerRef}
      className={clsx('search-box-filters', props.className)}
    >
      {filters.map((filter) => (
        <Dropdown
          key={filter.key}
          multi
          size="small"
          placeholder={filter.label}
          triggerLabel={filter.label}
          options={(filter.options || []).map((o) => ({
            name: o.label,
            value: o.value,
          }))}
          value={filter.value}
          onChange={(value) => onChange(filter.key, value as string[])}
        />
      ))}
      <Clear
        variant={'label2'}
        onClick={handleClear}
        className={`${showClear ? 'show' : ''}`}
      >
        <span>clear</span>
        <span> </span>
        <span>filters</span>
      </Clear>
    </Container>
  )
}

const Container = styled.div`
  &.search-box-filters {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 12px;

    ${({ theme }) => lsdUtils.breakpoint(theme, 'xs', 'exact')} {
      .lsd-dropdown--small {
        width: 135px;
      }
    }
  }
`

const Clear = styled(Typography)`
  opacity: 0;
  transition: all 0.2s ease-in-out;
  text-decoration: underline;
  cursor: pointer;

  &.show {
    opacity: 1;
  }

  ${(props) => lsdUtils.breakpoint(props.theme, 'xs', 'exact')} {
    span:not(:first-of-type) {
      display: none;
    }
  }
`
