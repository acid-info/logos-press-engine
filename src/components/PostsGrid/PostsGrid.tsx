/** @jsxImportSource @emotion/react */
import { Breakpoints, Theme, useTheme } from '@acid-info/lsd-react'
import { SerializedStyles, css } from '@emotion/react'
import styled from '@emotion/styled'
import React, { forwardRef, useMemo } from 'react'
import { LPE } from '../../types/lpe.types'
import { chunkArray, shuffleArray } from '../../utils/array.utils'
import { lsdUtils } from '../../utils/lsd.utils'
import { lcm } from '../../utils/math.utils'
import { PostCard, PostCardProps } from '../PostCard'

export type PostsGridProps = Partial<React.ComponentProps<typeof Container>> & {
  shows?: LPE.Podcast.Show[]
  posts?: LPE.Post.Document[]
  displayPodcastShow?: boolean
  displayYear?: boolean
  isHoverable?: boolean
  isSubtitleVisible?: boolean
  isClickable?: boolean
}

export const PostsGrid = forwardRef<HTMLDivElement, PostsGridProps>(
  (
    {
      posts = [],
      shows = [],
      pattern = [],
      breakpoints = [],
      bordered = false,
      horizontal = false,
      displayPodcastShow = true,
      displayYear = true,
      isHoverable = false,
      isSubtitleVisible = true,
      isClickable = false,
      ...props
    },
    ref,
  ) => {
    const theme = useTheme()

    const items = useMemo(() => {
      const cols = pattern.map((p) => p.cols)
      const sanitizedPosts = posts.filter(Boolean) as LPE.Post.Document[]
      const chunked = chunkArray(sanitizedPosts, ...cols)

      return chunked
        .map((posts, i) =>
          posts.filter(Boolean).map((post) => ({
            post,
            size: pattern[i % pattern.length]?.size,
          })),
        )
        .flat()
    }, [pattern, posts])

    const postCardStyles = useMemo(
      () => ({
        xxsmall: PostCard.styles.xxsmall(theme),
        xsmall: PostCard.styles.xsmall(theme),
        small: PostCard.styles.small(theme),
        medium: PostCard.styles.medium(theme),
        large: PostCard.styles.large(theme),
      }),
      [theme],
    )

    const loadingDelayEffectIndexes = useMemo(() => {
      return shuffleArray(items.map((_, i) => i))
    }, [items])

    return (
      <Container
        {...props}
        pattern={pattern}
        breakpoints={breakpoints}
        bordered={bordered}
        horizontal={horizontal}
        postCardStyles={postCardStyles}
      >
        <div className="row" ref={ref}>
          {items.map(({ post, size }, index) => (
            <div key={post.id} className="post-card-wrapper">
              <PostCard
                size={size as any}
                applySizeStyles={false}
                className="post-card"
                contentType={post.type}
                displayYear={displayYear}
                displayPodcastShow={displayPodcastShow}
                data={PostCard.toData(post, shows)}
                appearance={{
                  loadDelay: loadingDelayEffectIndexes[index] * 100,
                }}
                isHoverable={isHoverable}
                isSubtitleVisible={isSubtitleVisible}
                isClickable={isClickable}
              />
            </div>
          ))}
        </div>
      </Container>
    )
  },
)

PostsGrid.displayName = 'PostsGrid'

type Pattern = {
  cols: number
  maxWidth?: string
  size: PostCardProps['size']
  rowBorder?: boolean | 'except-first-row'
}
type Breakpoint = {
  pattern: Pattern[]
  breakpoint: Breakpoints
}

const createGridStyles = ({
  theme,
  pattern = [],
  postCardStyles,
  breakpoint = false,
  horizontal = false,
  bordered = false,
}: {
  theme: Theme
  postCardStyles: {
    [name: string]: SerializedStyles
  }
  pattern: Pick<Pattern, 'cols' | 'size' | 'maxWidth' | 'rowBorder'>[]
  breakpoint?: boolean
  horizontal?: boolean
  bordered: boolean | 'except-first-row'
}) => {
  const grid = !horizontal

  if (grid) {
    const cm = pattern.map((p) => p.cols).reduce(lcm, 1)
    const sum = Math.max(
      1,
      pattern.reduce((p, c) => p + c.cols, 0),
    )

    let selectorNumber = 0
    const selectors = pattern.map((p) => {
      const start = selectorNumber + 1
      selectorNumber += p.cols

      return new Array(p.cols)
        .fill(null)
        .map((i, index) => `${sum}n + ${start + index}`)
    })

    const firstRow = new Array(pattern?.[0]?.cols ?? 0)
      .fill(null)
      .map((v, i) => i + 1)
      .map((i) => `&:nth-of-type(${i})`)
      .join(', ')

    return css`
      > .row {
        display: grid;
        grid-template-columns: repeat(${cm}, 1fr);
        overflow: hidden;

        & > div {
          ${bordered &&
          css`
            border-top: 1px solid rgb(var(--lsd-border-primary));
          `}

          ${bordered === 'except-first-row' &&
          css`
            ${firstRow} {
              border-top: none;
            }
          `}

          ${pattern.map((p, i) => {
            const firstRow = new Array(p.cols)
              .fill(null)
              .map((v, i) => i + 1)
              .map((i) => `&:nth-of-type(${i})`)
              .join(', ')

            const rowSelectors = selectors[i].map((s) => `&:nth-of-type(${s})`)
            const firstSelector = rowSelectors[0]
            const lastSelector = rowSelectors[rowSelectors.length - 1]

            return css`
              ${rowSelectors.join(', ')} {
                grid-column: span ${cm / p.cols};
                position: relative;

                ${p.rowBorder &&
                bordered &&
                css`
                  border-top: none;
                `}

                ${p.rowBorder &&
                css`
                  ${firstSelector} {
                    &::before {
                      width: calc(100% * ${p.cols} + 16px);
                      height: 1px;
                      content: ' ';
                      top: 0;
                      left: 0px;
                      position: absolute;
                      display: block;
                      background: rgb(var(--lsd-border-primary));
                    }
                  }
                `} 

                ${p.rowBorder === 'except-first-row' &&
                css`
                  ${firstRow} {
                    &::before {
                      display: none !important;
                    }
                  }
                `} 

                .post-card {
                  --post-card-size: ${p.size};
                  ${postCardStyles[p.size as string].styles}
                }
              }
            `
          })}
        }
      }
    `
  } else {
    return css`
      overflow: hidden;

      > .row {
        display: flex;
        flex-direction: row;
        flex-wrap: unwrap;
        justify-content: flex-start;
        width: 100%;
        overflow: scroll;
        scroll-snap-type: x mandatory;
        gap: 0 32px;

        /* Chrome, Safari and Opera */
        &::-webkit-scrollbar {
          width: 0;
          display: none;
        }

        /* Firefox, Edge and IE */
        -ms-overflow-style: none;
        scrollbar-width: none;

        & > div {
          ${pattern.map(
            (p, i) => css`
              max-width: ${p.maxWidth ? p.maxWidth : 'unset'};
              flex-grow: 1 auto;
              flex-shrink: 0;
              width: calc((100% - (${p.cols - 1} * 32px)) / ${p.cols});
              flex-basis: calc((100% - (${p.cols - 1} * 32px)) / ${p.cols});
              scroll-snap-align: start !important;
              position: relative;

              .post-card {
                --post-card-size: ${p.size};
                ${postCardStyles[p.size as string].styles}
              }

              &:not(:last-child) {
                &::after {
                  width: 1px;
                  height: calc(100% - 48px);
                  content: ' ';
                  right: -16px;
                  top: 24px;
                  background: rgb(var(--lsd-border-primary));
                  position: absolute;
                }
              }
            `,
          )}
        }
      }
    `
  }
}

const Container = styled.div<{
  bordered: boolean | 'except-first-row'
  horizontal?: boolean
  pattern: Pattern[]
  breakpoints: Breakpoint[]
  postCardStyles: {
    [name: string]: SerializedStyles
  }
}>`
  display: grid;
  gap: var(--lsd-spacing-16);

  ${(props) => css`
    > .row {
      display: grid;
    }

    ${lsdUtils
      .breakpoints(props.breakpoints.map((b) => b.breakpoint))
      .map((breakpoint) =>
        lsdUtils.responsive(
          props.theme,
          breakpoint,
          'exact',
        )(css`
          ${createGridStyles({
            theme: props.theme,
            horizontal: props.horizontal,
            pattern: props.pattern,
            postCardStyles: props.postCardStyles,
            breakpoint: true,
            bordered: props.bordered,
          })}
        `),
      )}
  `}

  ${({ breakpoints = [], theme, postCardStyles, horizontal, bordered }) => {
    return breakpoints.map((b) =>
      lsdUtils.responsive(
        theme,
        b.breakpoint,
        'exact',
      )(css`
        ${createGridStyles({
          theme,
          horizontal,
          pattern: b.pattern,
          postCardStyles,
          breakpoint: true,
          bordered,
        })}
      `),
    )
  }}
`
