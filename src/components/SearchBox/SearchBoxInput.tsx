import { CloseIcon, Typography } from '@acid-info/lsd-react'
import styled from '@emotion/styled'
import clsx from 'clsx'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { copyConfigs } from '../../configs/copy.configs'
import { nope } from '../../utils/general.utils'

const placeholders = {
  global: copyConfigs.search.searchbarPlaceholders.global(),
  post: (
    <>
      <Typography variant="label1" component="span">
        {copyConfigs.search.searchbarPlaceholders.article()}
      </Typography>
      <Typography variant="label1" component="span">
        &nbsp;
      </Typography>
      <Link href="/search">
        <Typography variant="label1" component="span">
          global search
        </Typography>
      </Link>
    </>
  ),
}

export type SearchBoxInputProps = Partial<
  Omit<
    React.ComponentProps<typeof Container>,
    'value' | 'onChange' | 'placeholder'
  >
> & {
  value?: string
  keepEnlarged?: boolean
  showClearButton?: boolean
  globalMode?: boolean
  triggerOnBlur?: boolean

  onChange?: (value: string, event?: 'clear') => void
  onFocusChange?: (value: boolean) => void
  onActive?: (value: boolean) => void
}

export const SearchBoxInput: React.FC<SearchBoxInputProps> = ({
  value = '',
  keepEnlarged = false,
  showClearButton = false,
  globalMode = false,
  triggerOnBlur = false,
  onChange = nope,
  onFocusChange = nope,
  onActive = nope,
  ...props
}) => {
  const [input, setInput] = useState(value)
  const [focused, setFocused] = useState(false)

  const [placeholder, setPlaceholder] = useState<React.ReactNode>(
    placeholders[globalMode ? 'global' : 'post'],
  )

  const enlarged = !keepEnlarged
    ? focused || input.length > 0
    : input.length !== 0 || focused

  const handleKeyUp = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onChange(input)
    }
  }

  useEffect(() => {
    if (input !== value) setInput(value)
  }, [value])

  useEffect(() => {
    onFocusChange(focused)
  }, [focused])

  const handleClear = () => {
    setInput('')
    onChange('', 'clear')
  }

  useEffect(() => {
    if (focused) {
      setPlaceholder('')
    } else {
      setTimeout(() => {
        setPlaceholder(placeholders[globalMode ? 'global' : 'post'])
      }, 200)
    }
  }, [focused, globalMode])

  useEffect(() => {
    onActive(focused || input.length > 0)
  }, [focused, input])

  return (
    <Container
      {...props}
      className={clsx(
        'search-box-input',
        enlarged && 'search-box-input--active',
        props.className,
      )}
    >
      <div className="search-box-input__wrapper">
        <input
          className={`search-box-input__input`}
          placeholder={typeof placeholder === 'string' ? placeholder : ''}
          value={input as string}
          onFocus={() => {
            setFocused(true)
          }}
          onKeyUp={handleKeyUp}
          onChange={(e) => setInput(e.target.value)}
          onBlurCapture={() => {
            setFocused(false)
            if (triggerOnBlur) onChange(input)
          }}
        />
        {placeholder &&
          typeof placeholder !== 'string' &&
          input.length === 0 && (
            <>
              <span className="search-box-input__placeholder">
                {placeholder}
              </span>
            </>
          )}
        <div className="search-box-input__clear">
          <span className="search-box-input__text">
            <pre>{input}</pre>
          </span>
          {showClearButton && !focused && input.trim().length > 0 && (
            <CloseIcon
              className="search-box-input__clear-button"
              color="primary"
              onClick={handleClear}
            />
          )}
        </div>
      </div>
    </Container>
  )
}

const Container = styled.div`
  &.search-box-input {
    flex-grow: 1;
    min-width: 0;
    max-width: calc(100% - 32px);
  }

  .search-box-input__input {
    background: transparent;
    font-size: var(--lsd-label1-fontSize);
    line-height: var(--lsd-label1-lineHeight);
    outline: none;
    border: none;
    width: 100%;
    height: 44px;

    ::placeholder,
    :-ms-input-placeholder {
      color: rgba(var(--lsd-text-primary), 0.3);
      font-size: var(--lsd-h4-lineHeight);
      line-height: var(--lsd-h4-lineHeight);
      position: absolute;
      top: 50%;
      left: 2px;
      transform: translateY(-50%);
      padding: 0;
    }
  }

  .search-box-input__wrapper {
    position: relative;

    display: grid;
    grid-template-rows: auto;
    grid-template-columns: 100%;
    width: 100%;
    max-width: 100%;
    overflow: hidden;

    & > * {
      grid-area: 1 / 1 / 1 / 1;
      font-size: var(--lsd-label1-fontSize);
      line-height: var(--lsd-label1-lineHeight);
      height: 44px;
      padding: 1px 2px;
      transition: all 0.2s ease-in-out;
      max-width: 100%;
    }
  }

  .search-box-input__clear {
    display: flex;
    flex-direction: row;
    align-items: center;
    pointer-events: none;
    max-width: 100%;

    span {
      display: inline;
      opacity: 0;
      visibility: hidden;
    }

    .lsd-icon {
      margin-left: 14px;
      cursor: pointer;
      pointer-events: all;
    }
  }

  .search-box-input__placeholder {
    display: flex;
    flex-direction: row;
    align-items: center;
    pointer-events: none;
    font-size: var(--lsd-h4-lineHeight);
    line-height: var(--lsd-h4-lineHeight);

    & > *:not(a) {
      opacity: 0.34;
    }

    a {
      pointer-events: all;
    }
  }

  &.search-box-input--active {
    .search-box-input__wrapper > * {
      font-size: var(--lsd-h4-lineHeight);
      line-height: var(--lsd-h4-lineHeight);
    }
  }
`
