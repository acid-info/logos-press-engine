import { LPE } from '@/types/lpe.types'
import { formatDate } from '@/utils/date.utils'
import { Typography } from '@acid-info/lsd-react'
import styled from '@emotion/styled'
import React, { FC } from 'react'
import { DotIcon } from '../Icons/DotIcon'
import PostType = LPE.PostType

export type Props = React.ComponentProps<typeof Container> & {
  contentType: PostType
  date: Date | null
  displayYear?: boolean
  size?: 'small' | 'medium' | 'large'
  tags?: string[]
}

export const PostCardLabel: FC<Props> = ({
  displayYear = true,
  contentType,
  date,
  tags = [],
  ...props
}) => {
  const isCommunity = tags.includes('Community')
  return (
    <Container {...props} className={`post-card__label ${props.className}`}>
      <ContentType variant="subtitle2" genericFontFamily="sans-serif">
        {isCommunity ? 'Community Article' : contentType}
      </ContentType>
      {date && (
        <>
          <DotIcon color="primary" />
          <Date variant="subtitle2" genericFontFamily="sans-serif">
            {formatDate(date, { withYear: displayYear })}
          </Date>
        </>
      )}
      {props.children && (
        <>
          <DotIcon color="primary" />
          {props.children}
        </>
      )}
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
`

const Date = styled(Typography)`
  text-transform: capitalize;
`

const ContentType = styled(Typography)`
  text-transform: capitalize;
`
