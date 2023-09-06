import styled from '@emotion/styled'
import Image, { ImageLoader, ImageProps } from 'next/image'
import React, { useState } from 'react'
import { LPE } from '../../types/lpe.types'

export type ResponsiveImageProps = {
  height?: number | string | null
  nextImageProps?: Partial<ImageProps>
  fill?: boolean
  className?: string
}

export type Props = {
  data: LPE.Image.Document
  alt?: string
} & ResponsiveImageProps

const unbodyImageLoader: ImageLoader = ({ src, width, quality }) =>
  `${src}?w=${width}&q=${quality || 75}&auto=format`

export const ResponsiveImage = ({
  data,
  height,
  fill = false,
  nextImageProps,
  className,
  children,
}: React.PropsWithChildren<Props>) => {
  const [loaded, setLoaded] = useState(false)

  const lazyUrl = `${data.url}?blur=200&px=16&auto=format`

  const imageProps: ImageProps = {
    src: `${data.url}`,
    width: data.width,
    height: data.height,
    alt: data.alt,
    className: loaded ? 'loaded' : '',
    onLoad: () => setLoaded(true),
    loading: 'lazy',
    ...(data.url.startsWith('https://images.cdn.unbody.io')
      ? { loader: unbodyImageLoader }
      : {}),
    ...(nextImageProps || {}),
    style: {
      width: '100%',
      height: 'auto',
    },
  }

  return (
    <Container
      className={`${fill ? 'fill' : ''} ${className || ''}`}
      style={{
        paddingTop: height ? 0 : `calc(${data.height / data.width} * 100%)`,
        height: height || 'auto',
      }}
    >
      <div>
        <img src={lazyUrl} alt={data.alt} title={data.alt} />
        {children}
      </div>
      <div className={imageProps.className}>
        <Image {...imageProps} alt={data.alt} title={data.alt} />
        {children}
      </div>
    </Container>
  )
}

const Container = styled.div`
  position: relative;
  width: 100%;
  overflow: hidden;
  filter: grayscale(100%);
  transition: filter 0.1s ease-in-out;

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
      transition: opacity 250ms;

      &.loaded {
        opacity: 1;
      }
    }
  }
`
