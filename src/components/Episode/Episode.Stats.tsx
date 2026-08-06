import { Typography } from '@acid-info/lsd-react'
import styled from '@emotion/styled'
import { lsdUtils } from '../../utils/lsd.utils'

const EpisodeStats = ({
  date,
  duration,
}: {
  date: Date | null
  duration: number
}) => (
  <Row>
    {duration > 0 && (
      <>
        <Typography variant="body3" genericFontFamily="sans-serif">
          {duration} minutes
        </Typography>
        <Typography variant="body3">•</Typography>
      </>
    )}
    <Typography variant="body3" genericFontFamily="sans-serif">
      {date &&
        date.toLocaleString('en-GB', {
          day: 'numeric',
          month: 'long', // TODO: Should be uppercase
          year: 'numeric',
        })}
    </Typography>
  </Row>
)

const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  margin-top: 32px;

  ${(props) => lsdUtils.breakpoint(props.theme, 'xs', 'down')} {
    margin-top: 24px;
  }
`

export default EpisodeStats
