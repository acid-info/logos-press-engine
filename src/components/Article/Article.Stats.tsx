import { Typography } from '@acid-info/lsd-react'
import styled from '@emotion/styled'
import { formatDate } from '../../utils/date.utils'
import { DotIcon } from '../Icons/DotIcon'

const ArticleStats = ({
  date,
  readingLength,
}: {
  date: Date | null
  readingLength: number
}) => (
  <Row>
    <Typography variant="body3" genericFontFamily="sans-serif">
      {readingLength} MIN
    </Typography>
    {date && (
      <>
        <DotIcon color="primary" />
        <Date variant="body3" genericFontFamily="sans-serif">
          {formatDate(date)}
        </Date>
      </>
    )}
  </Row>
)

const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
`

const Date = styled(Typography)`
  text-transform: uppercase;
`

export default ArticleStats
