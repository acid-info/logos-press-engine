import { LPE } from '@/types/lpe.types'
import { Theme, Typography } from '@acid-info/lsd-react'
import { css } from '@emotion/react'
import styled from '@emotion/styled'
import clsx from 'clsx'
import Image from 'next/image'
import Link from 'next/link'
import { lsdUtils } from '../../utils/lsd.utils'
import { getPostLink } from '../../utils/route.utils'

type Size = 'small' | 'medium' | 'large'

export type PostCardShowDetailsProps = React.HTMLAttributes<HTMLAnchorElement> &
  Partial<CustomLinkProps> & {
    title: string
    slug: string
    episodeNumber: number
    logo?: LPE.Image.Document
    podcast: LPE.Podcast.Show
  }

// TODO
export const PostCardShowDetails = ({
  slug,
  episodeNumber,
  podcast,
  size = 'medium',
  applySizeStyles = true,
  ...props
}: PostCardShowDetailsProps) => {
  return (
    <CustomLink
      {...props}
      href={getPostLink('podcast', { showSlug: slug })}
      applySizeStyles={applySizeStyles}
      className={clsx('show-details', `show-details--${size}`, props.className)}
    >
      <div className="show-details__container">
        {podcast && (
          <>
            <Image
              src={podcast?.logo?.url}
              width={38}
              height={38}
              alt={podcast.logo.alt}
              className="show-details__logo"
            />
            <Typography variant="label1" className="show-details__title">
              {podcast.title}
            </Typography>
          </>
        )}
      </div>
    </CustomLink>
  )
}

PostCardShowDetails.styles = {
  small: (theme: Theme) => css`
    .show-details__title {
      ${lsdUtils.typography('label2')}
    }

    .show-details__logo {
      width: 24px;
      height: 24px;
    }
  `,

  large: (theme: Theme) => css`
    .show-details__title {
      ${lsdUtils.typography('label1')}
    }

    .show-details__logo {
      width: 28px;
      height: 28px;
    }
  `,
}

type CustomLinkProps = {
  size?: Size
  applySizeStyles?: boolean
}

const CustomLink = styled(Link)<CustomLinkProps>`
  .show-details {
    &__container {
      display: flex;
      gap: 12px;
      align-items: center;
      cursor: pointer;

      label {
        cursor: pointer;
      }
    }

    &__logo {
      border-radius: 100%;
    }
  }

  &.show-details--small {
    ${(props) =>
      props.applySizeStyles && PostCardShowDetails.styles.small(props.theme)}
  }

  &.show-details--large {
    ${(props) =>
      props.applySizeStyles && PostCardShowDetails.styles.large(props.theme)}
  }
`

/**
 *  &.show-details {
    ${(props) => lsdUtils.breakpoint(props.theme, 'xs', 'down')} {
      ${(props) =>
        props.xsSize &&
        props.applySizeStyles &&
        PostCardShowDetails.styles[props.xsSize](props.theme)}
    }

    ${(props) => lsdUtils.breakpoint(props.theme, 'sm', 'up')} {
      ${(props) =>
        props.smSize &&
        props.applySizeStyles &&
        PostCardShowDetails.styles[props.smSize](props.theme)}
    }

    ${(props) => lsdUtils.breakpoint(props.theme, 'md', 'up')} {
      ${(props) =>
        props.mdSize &&
        props.applySizeStyles &&
        PostCardShowDetails.styles[props.mdSize](props.theme)}
    }

    ${(props) => lsdUtils.breakpoint(props.theme, 'lg', 'up')} {
      ${(props) =>
        props.lgSize &&
        props.applySizeStyles &&
        PostCardShowDetails.styles[props.lgSize](props.theme)}
    }
  }
 * 
 */
