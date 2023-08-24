import { Collapse, Typography } from '@acid-info/lsd-react'
import styled from '@emotion/styled'
import { LPE } from '../../../types/lpe.types'
import { useState } from 'react'

const EpisodeCredits = ({
  credits,
}: {
  credits: LPE.Podcast.Document['credits']
}) => {
  const [open, setOpen] = useState(true)

  return credits && credits?.length > 0 ? (
    <Container>
      <Collapse
        label="Credits"
        open={open}
        onChange={() => setOpen((prev) => !prev)}
      >
        <Credits>
          {credits?.map((credit, idx) => (
            <Credit key={idx}>
              <Typography
                component="p"
                variant="body3"
                id={credit.id.replace('#', '')}
              >
                {credit.text}
              </Typography>
            </Credit>
          ))}
        </Credits>
      </Collapse>
    </Container>
  ) : null
}

const Container = styled.div`
  margin-bottom: 32px;

  button {
    width: 100% !important;
  }
`

const Credits = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--lsd-body3-lineHeight);
  padding: 12px 14px;
`

const Credit = styled.div`
  display: flex;
  flex-direction: flex;
  align-items: center;
`

export default EpisodeCredits
