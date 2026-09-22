import { Typography } from '@acid-info/lsd-react'
import styled from '@emotion/styled'
import Link from 'next/link'
import { LPE } from '../../types/lpe.types'
import { formatDate } from '../../utils/date.utils'
import { Authors } from '../Authors'

type Props = {
  data: LPE.Article.Metadata
}

export default function ArticleReference({
  data: { title, modifiedAt, authors, slug },
  ...props
}: Props) {
  const localDate = modifiedAt && formatDate(new Date(modifiedAt))

  return (
    <Container {...props}>
      <ArticleLink href={slug}>
        <Typography component="span" variant="body1">
          {title}
        </Typography>
      </ArticleLink>
      <Info>
        <Authors authors={authors} />
        <Typography variant="body3">•</Typography>
        <Typography variant="body3" genericFontFamily="sans-serif">
          {localDate}
        </Typography>
      </Info>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 12px 14px;
  border-bottom: 1px solid rgb(var(--lsd-border-primary));
  text-decoration: none;

  &:last-child {
    border-bottom: none;
  }
`

const ArticleLink = styled(Link)`
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`

const Info = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
`
