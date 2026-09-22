import { Typography } from '@acid-info/lsd-react'
import styled from '@emotion/styled'
import { formatDate } from '../../utils/date.utils'

export enum BlockType {
  TEXT = 'text',
  IMAGE = 'image',
}

type Props = {
  type: BlockType
  date: Date | null
}

const ContentBlockHeader = ({ type, date }: Props) => {
  return (
    <ContentBlockInfo>
      <Typography variant="body3" genericFontFamily="sans-serif">
        {type === BlockType.TEXT ? 'PARAGRAPH' : 'IMAGE'}
      </Typography>
      <Typography variant="body3">•</Typography>
      <Typography variant="body3" genericFontFamily="sans-serif">
        {date && formatDate(date)}
      </Typography>
    </ContentBlockInfo>
  )
}

const ContentBlockInfo = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
`

export default ContentBlockHeader
