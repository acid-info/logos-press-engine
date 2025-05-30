import { PostCardCover } from '@/components/PostCard/PostCard.Cover'
import {
  PostCardShowDetails,
  PostCardShowDetailsProps,
} from '@/components/PostCard/PostCard.ShowDetails'
import { PostCardSubTitle } from '@/components/PostCard/PostCard.Subtitle'
import { PostCardTitle } from '@/components/PostCard/PostCard.Title'
import { Theme } from '@acid-info/lsd-react'
import { CommonProps } from '@acid-info/lsd-react/dist/utils/useCommonProps'
import { css } from '@emotion/react'
import styled from '@emotion/styled'
import clsx from 'clsx'
import React from 'react'
import { LPE } from '../../types/lpe.types'
import { lsdUtils } from '../../utils/lsd.utils'
import { getPostLink } from '../../utils/route.utils'
import { Authors } from '../Authors'
import { ResponsiveImageProps } from '../ResponsiveImage/ResponsiveImage'
import { PostCardLabel } from './PostCard.Label'

export type PostAppearanceProps = {
  imageProps?: ResponsiveImageProps
  loadDelay?: number
}

export type PostDataProps = {
  slug: string
  date: Date | null
  title: string
  subtitle?: string
  authors?: LPE.Author.Document[]
  tags?: string[]
  coverImage?: LPE.Article.Data['coverImage'] | null
  podcastShowDetails?: PostCardShowDetailsProps
}

export type PostCardProps = CommonProps &
  React.HTMLAttributes<HTMLDivElement> & {
    appearance?: PostAppearanceProps
    data: PostDataProps
    contentType: LPE.PostType
    size?: 'xxsmall' | 'xsmall' | 'small' | 'medium' | 'large'
    applySizeStyles?: boolean
    displayPodcastShow?: boolean
    displayYear?: boolean
    isHoverable?: boolean
  }

export const PostCard = (_props: PostCardProps) => {
  const {
    appearance: { imageProps = {}, loadDelay = 0 } = {},
    data: {
      coverImage = null,
      date,
      title,
      subtitle,
      authors,
      slug,
      podcastShowDetails,
    },
    size = 'small',
    contentType,
    applySizeStyles = true,
    displayPodcastShow = true,
    displayYear = true,
    isHoverable = false,
    ...props
  } = _props

  const link = getPostLink(contentType, {
    showSlug: podcastShowDetails?.slug,
    postSlug: slug,
  })

  const coverImageElement = coverImage ? (
    <PostCardCover
      href={link}
      imageProps={imageProps}
      imageData={coverImage}
      playIcon={contentType === LPE.PostTypes.Podcast}
      loadDelay={loadDelay}
    />
  ) : (
    <div className="post-card__cover-image"></div>
  )

  const authorsLabelElement = contentType === 'article' &&
    authors &&
    authors.length > 0 && (
      <div className="post-card__authors-label">
        <Authors authors={authors} separator={false} />
      </div>
    )

  const metaLabelElement = (
    <PostCardLabel
      contentType={contentType}
      displayYear={displayYear}
      date={date}
    />
  )

  const titleElement = <PostCardTitle href={link}>{title}</PostCardTitle>

  const subtitleElement = subtitle && (
    <PostCardSubTitle>{subtitle}</PostCardSubTitle>
  )

  const showElement = displayPodcastShow && podcastShowDetails && (
    <PostCardShowDetails
      {...podcastShowDetails}
      className="post-card__show-details"
      applySizeStyles={false}
      size={'small'}
    />
  )

  return (
    <Container
      className={clsx(
        'post-card',
        applySizeStyles && applySizeStyles && `post-card--${size}`,
        coverImageElement && 'post-card--with-image',
        props.className,
        `post-card--${contentType}`,
        isHoverable && 'post-card--is-hoverable',
      )}
    >
      {coverImageElement}
      {titleElement}
      {authorsLabelElement}
      {subtitleElement}
      {showElement}
      {metaLabelElement}
    </Container>
  )
}

PostCard.toData = (post: LPE.Post.Document, shows: LPE.Podcast.Show[] = []) => {
  const show =
    post.type === 'podcast'
      ? post.show || shows.find((show) => show.id === post.showId) || shows[0]
      : undefined

  return {
    date:
      post.type === 'podcast'
        ? post.publishedAt
          ? new Date(post.publishedAt)
          : null
        : post.modifiedAt
        ? new Date(post.modifiedAt)
        : null,
    slug: post.slug,
    title: post.title,
    authors: post.type === 'article' ? post.authors : [],
    coverImage: post.coverImage,
    subtitle: (post.type === 'article' && post.subtitle) || '',
    tags: post.tags.map((tag) => tag.name),
    ...(post.type === 'podcast' && show
      ? {
          podcastShowDetails: {
            episodeNumber: post.episodeNumber,
            title: show.title,
            slug: show.slug,
            podcast: show,
          },
        }
      : {}),
  }
}

PostCard.styles = {
  xxsmall: (theme: Theme) => css``,
  xsmall: (theme: Theme) => css``,
  small: (theme: Theme) => css`
    padding-bottom: var(--lsd-spacing-8);

    .post-card__title {
      margin-top: var(--lsd-spacing-16);
    }

    .post-card__title-text {
      ${lsdUtils.typography('h5')}

      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      max-height: calc(3 * var(--lsd-h4-lineHeight));
    }

    .post-card__subtitle {
      ${lsdUtils.typography('subtitle4')}

      margin-top: var(--lsd-spacing-16);
    }

    .post-card__label {
      margin-top: var(--lsd-spacing-16);

      * {
        ${lsdUtils.typography('subtitle4')}
      }
    }

    &.post-card__search-explore {
    }

    .post-card__show-details {
      ${PostCardShowDetails.styles.small(theme)}

      margin-top: var(--lsd-spacing-16);
    }

    .post-card__cover-image {
      & > div {
        padding-top: calc(9 / 16 * 100%) !important;

        & > div {
          width: 100%;
          height: 100%;
        }

        & > div > img {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover;
          object-position: center center;
        }
      }
    }
  `,
  medium: (theme: Theme) => css`
    padding-bottom: var(--lsd-spacing-8);

    .post-card__title {
      margin-top: var(--lsd-spacing-24);
    }

    .post-card__title-text {
      ${lsdUtils.typography('h2')}

      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      max-height: calc(3 * var(--lsd-h2-lineHeight));
    }

    .post-card__label {
      margin-top: var(--lsd-spacing-16);

      * {
        ${lsdUtils.typography('subtitle2')}
      }
    }

    .post-card__show-details {
      ${PostCardShowDetails.styles.large(theme)}

      margin-top: var(--lsd-spacing-24);
    }

    .post-card__cover-image {
      & > div {
        padding-top: calc(9 / 16 * 100%) !important;

        & > div {
          width: 100%;
          height: 100%;
        }

        & > div > img {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover;
          object-position: center center;
        }
      }
    }
  `,
  large: (theme: Theme) => css`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-areas:
      'info image'
      'info image'
      'info image'
      'meta image';
    gap: 0 var(--lsd-spacing-64);
    padding: var(--lsd-spacing-24);

    .post-card__title-text {
      ${lsdUtils.typography('h1')}

      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      max-height: calc(3 * var(--lsd-h1-lineHeight));
    }

    .post-card__subtitle {
      margin-top: var(--lsd-spacing-32);
    }

    .post-card__cover-image {
      grid-area: image;

      & > div {
        padding-top: calc(9 / 16 * 100%) !important;

        & > div {
          width: 100%;
          height: 100%;
        }

        & > div > img {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover;
          object-position: center center;
        }
      }
    }

    .post-card__label {
      grid-area: meta;
      align-self: end;
      * {
        ${lsdUtils.typography('subtitle2')}
      }
    }

    .post-card__title {
      grid-area: info;
      grid-row: auto;
    }

    .post-card__authors-label,
    .post-card__show-details {
      grid-area: info;
      grid-row: auto;
    }

    .post-card__tags {
      grid-area: info;
      grid-row: auto;
    }

    .post-card__show-details {
      ${PostCardShowDetails.styles.large(theme)}
    }

    &:not(.post-card--with-image) {
    }

    &.post-card__search-explore {
    }

    &.post-card__search-result {
      padding: 0;
      gap: 0 var(--lsd-spacing-96);
      grid-template-columns: 7fr 3fr;

      .post-card__title-text {
        ${lsdUtils.typography('h4')}

        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        max-height: calc(3 * var(--lsd-h4-lineHeight));
      }

      .post-card__label {
        margin-top: var(--lsd-spacing-16);

        * {
          ${lsdUtils.typography('subtitle4')}
        }
      }

      .post-card__subtitle {
        margin-top: var(--lsd-spacing-16);
      }

      .post-card__show-details {
        ${PostCardShowDetails.styles.small(theme)}

        margin-top: var(--lsd-spacing-16);
      }

      ${lsdUtils.breakpoint(theme, 'xs', 'exact')} {
        gap: 0 var(--lsd-spacing-24);
        grid-template-areas: unset;
        grid-template-columns: 1fr 94px;
        grid-template-rows: auto auto auto;

        & > * {
          grid-area: unset;
          grid-column: span 2;
        }

        .post-card__title {
          grid-area: unset;
          grid-row: auto;
        }

        .post-card__title-text {
          ${lsdUtils.typography('subtitle1')}

          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          max-height: calc(2 * var(--lsd-subtitle1-lineHeight));
        }

        .post-card__subtitle {
          ${lsdUtils.typography('subtitle4')}
        }

        .post-card__cover-image {
          grid-area: unset;
          grid-column: 2 / 3;
          grid-row: 1 / 2;

          & > div {
            padding-top: calc(9 / 16 * 94px) !important;

            & > div {
              width: 94px;
              height: 100%;
            }

            & > div > img {
              width: 100% !important;
              height: 100% !important;
              object-fit: cover;
              object-position: center center;
            }
          }
        }
      }
    }
  `,
}

const Container = styled.div<Pick<PostCardProps, 'size'>>`
  display: flex;
  flex-direction: column;
  position: 'relative';

  .post-card__title {
    text-decoration: none;
    width: fit-content;
  }

  .post-card__title-text,
  .post-card__subtitle {
    text-overflow: ellipsis;
    overflow: hidden;
    word-break: break-word;
  }

  .post-card__authors-label {
    margin-top: var(--lsd-spacing-16);

    p.lsd-typography {
      font-size: 1rem;
      line-height: 1.5rem;
    }
  }

  .post-card__show-details {
    margin-top: var(--lsd-spacing-16);
  }

  &.post-card--is-hoverable:hover {
    background-color: rgb(var(--lsd-theme-primary));
    * {
      color: rgb(var(--lsd-theme-secondary));
      border-color: rgb(var(--lsd-theme-secondary));
      fill: rgb(var(--lsd-theme-secondary));
    }
  }

  &.post-card--xxsmall {
    ${({ theme }) => PostCard.styles.xxsmall(theme)}
  }

  &.post-card--xsmall {
    ${({ theme }) => PostCard.styles.xsmall(theme)}
  }

  &.post-card--small {
    ${({ theme }) => PostCard.styles.small(theme)}
  }

  &.post-card--medium {
    ${({ theme }) => PostCard.styles.medium(theme)}
  }

  &.post-card--large {
    ${({ theme }) => PostCard.styles.large(theme)}
  }
`
