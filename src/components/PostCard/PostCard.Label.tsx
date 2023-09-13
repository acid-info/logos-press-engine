import { LPE } from '@/types/lpe.types'
import { Typography } from '@acid-info/lsd-react'
import styled from '@emotion/styled'
import React, { FC } from 'react'
import { DotIcon } from '../Icons/DotIcon'
import PostType = LPE.PostType

export type Props = React.ComponentProps<typeof Container> & {
  contentType: PostType
  date: Date | null
  displayYear?: boolean
}

export const PostCardLabel: FC<Props> = ({
  displayYear = true,
  contentType,
  date,
  ...props
}) => {
  return (
    <Container {...props} className={`post-card__label ${props.className}`}>
      <Typography variant="body3" genericFontFamily="sans-serif">
        {contentType.toUpperCase()}
      </Typography>
      {date && (
        <>
          <DotIcon color="primary" />
          <Date variant="body3" genericFontFamily="sans-serif">
            {date.toLocaleString('en-GB', {
              day: 'numeric',
              month: 'short',
              ...(displayYear
                ? {
                    year: 'numeric',
                  }
                : {}),
            })}
          </Date>
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
  text-transform: uppercase;
`
