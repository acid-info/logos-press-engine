import { lsdUtils } from '@/utils/lsd.utils'
import styled from '@emotion/styled'
import { ImageProps } from 'next/image'
import { LPE } from '../../types/lpe.types'
import { LightBox } from '../LightBox'
import { ResponsiveImage } from '../ResponsiveImage/ResponsiveImage'

type Props = {
  image: LPE.Image.Document
  order: number
  nextImageProps?: Partial<ImageProps>
}

export const ArticleImageBlockWrapper = ({
  image,
  order,
  nextImageProps,
}: Props) => {
  return (
    <Container id={`i-${order}`}>
      <LightBox caption={image.captionHTML || ''}>
        <ResponsiveImage data={image} nextImageProps={nextImageProps} />
      </LightBox>
    </Container>
  )
}

const Container = styled.figure`
  margin: 40px 0 40px 0;
  padding: 0;
  display: flex;
  flex-direction: column;

  ${(props) => lsdUtils.breakpoint(props.theme, 'sm', 'down')} {
    margin: 24px 0 24px 0;
  }
`
