import { Typography } from '@acid-info/lsd-react'
import styled from '@emotion/styled'
import { PropsWithChildren } from 'react'

type Props = PropsWithChildren<{
  title: string
  matches?: number
}>

export const Section = ({ title, matches, children, ...props }: Props) => {
  return (
    <section {...props}>
      <Container>
        <Typography genericFontFamily="sans-serif" variant="body2">
          {title}
        </Typography>
        {matches && (
          <>
            <Typography variant="body2">•</Typography>
            <Typography genericFontFamily="sans-serif" variant="body2">
              {matches} matches
            </Typography>
          </>
        )}
      </Container>
      {children}
    </section>
  )
}

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 16px;
`
