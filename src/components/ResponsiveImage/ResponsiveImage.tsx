import styled from '@emotion/styled'
import Image, { ImageProps } from 'next/image'
import React, { useEffect, useMemo, useState } from 'react'
import { LPE } from '../../types/lpe.types'

export type ResponsiveImageProps = {
  height?: number | string | null
  nextImageProps?: Partial<ImageProps>
  fill?: boolean
  className?: string
  loadDelay?: number
}

export type Props = {
  data: LPE.Image.Document
  alt?: string
} & ResponsiveImageProps

export const ResponsiveImage = ({
  data,
  height,
  fill = false,
  nextImageProps,
  className,
  children,
  loadDelay = 0,
}: React.PropsWithChildren<Props>) => {
  const [loaded, setLoaded] = useState(false)
  const placeholderSrc = useMemo(() => {
    const rawPlaceholder = data.placeholder?.trim()
    if (!rawPlaceholder) return ''

    const localPlaceholder = rawPlaceholder.replace('/public/', '/')
    if (!localPlaceholder.startsWith('/uploads/')) return localPlaceholder

    try {
      return new URL(localPlaceholder, data.url).toString()
    } catch {
      return ''
    }
  }, [data.placeholder, data.url])
  const [showPlaceholder, setShowPlaceholder] = useState(
    placeholderSrc.length > 0,
  )

  useEffect(() => {
    setShowPlaceholder(placeholderSrc.length > 0)
  }, [placeholderSrc])

  const shouldPriority = Boolean(nextImageProps?.priority)
  const loading = nextImageProps?.loading || (shouldPriority ? 'eager' : 'lazy')

  const imageProps: ImageProps = {
    src: `${data.url}`,
    width: data.width,
    height: data.height,
    alt: data.alt,
    className: loaded ? 'loaded' : '',
    onLoad: () => {
      setTimeout(() => {
        setLoaded(true)
      }, loadDelay)
    },
    loading,
    ...(nextImageProps || {}),
    style: {
      width: '100%',
      height: 'auto',
    },
  }

  return (
    <Container
      className={`${fill ? 'fill' : ''} ${className || ''}`}
      $height_={height}
      $imageWidth={data.width}
      $imageHeight={data.height}
    >
      <div className="comment">
        {showPlaceholder && (
          <img
            src={placeholderSrc}
            alt={data.alt}
            title={data.alt}
            onError={() => setShowPlaceholder(false)}
          />
        )}
        {children}
      </div>
      <div className={imageProps.className}>
        <Image {...imageProps} alt={data.alt} title={data.alt} />
        {children}
      </div>
    </Container>
  )
}

type ContainerProps = {
  $height_?: number | string | null
  $imageWidth: number
  $imageHeight: number
}

const Container = styled('div')<ContainerProps>`
  position: relative;
  width: 100%;
  overflow: hidden;
  filter: grayscale(100%);
  transition: filter 0.1s ease-in-out;
  height: ${(props) => props.$height_ || 'auto'};
  padding-top: ${(props) =>
    props.$height_
      ? 0
      : `calc(${props.$imageHeight / props.$imageWidth} * 100%)`};

  :hover {
    filter: grayscale(0%);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  > * {
    position: absolute !important;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;

    &:last-of-type {
      opacity: 0;
      transition: opacity 500ms;

      &.loaded {
        opacity: 1;
      }
    }
  }
`
