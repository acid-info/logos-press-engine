import { Typography } from '@acid-info/lsd-react'
import styled from '@emotion/styled'
import React from 'react'
import { LPE } from '../../types/lpe.types'
import { lsdUtils } from '../../utils/lsd.utils'
import PodcastHost from './Podcast.Host'

export enum Size {
  SMALL = 'small',
  LARGE = 'large',
}

export type PodcastShowCardProps = React.ComponentProps<typeof Container> & {
  show: LPE.Podcast.Show
}

export default function PodcastShowCard({
  show,
  ...props
}: PodcastShowCardProps) {
  return (
    <Container {...props}>
      <ShowData>
        <Title variant="h2" genericFontFamily="serif">
          {show.title}
        </Title>
        <PodcastHost show={show} />
        <Description
          variant="body2"
          dangerouslySetInnerHTML={{ __html: show.description }}
        />
      </ShowData>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`

const Title = styled(Typography)`
  margin-bottom: 16px;
`

const ShowData = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`

const Description = styled(Typography)`
  margin-top: 16px;
  max-width: 518px;
  text-align: center;

  ${(props) => lsdUtils.breakpoint(props.theme, 'sm', 'exact')} {
    margin-top: 12px;
  }

  ${(props) => lsdUtils.breakpoint(props.theme, 'md', 'exact')} {
    margin-top: 12px;
  }

  ${(props) => lsdUtils.breakpoint(props.theme, 'xs', 'down')} {
    text-align: center;
    margin-top: 8px;
  }
`
