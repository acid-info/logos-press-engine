import { Typography } from '@acid-info/lsd-react'
import styled from '@emotion/styled'

export default function Hero() {
  return (
    <Container>
      <Title genericFontFamily="serif" component="h1" variant="h1">
        LOGOS → PRESS ENGINE
      </Title>
      <Description component="div" variant="label2">
        Blog with media written by Logos members
      </Description>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 16px 8px 16px;

  @media (max-width: 768px) {
    align-items: flex-start;
  }
`

const Title = styled(Typography)`
  // temporary breakpoint
  @media (min-width: 1440px) {
    padding-block: 16px;
    font-size: 90px;
  }
`

const Description = styled(Typography)`
  margin-top: 6px;
`
