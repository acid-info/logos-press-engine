import styled from '@emotion/styled'
import { LPE } from '../../types/lpe.types'
import ArticleBlocks from './Article.Blocks'
import ArticleDynamicBlocks from './Article.DynamicBlocks'
import ArticleFooter from './Footer/Article.Footer'
import ArticleHeader from './Header/Article.Header'

interface Props {
  data: LPE.Article.Document
  header?: boolean
  footer?: boolean
}

export default function ArticleBody({
  data,
  header = true,
  footer = true,
}: Props) {
  return (
    <ArticleContainer>
      {header && <ArticleHeader {...data.data} />}
      {data.data.blocks && data.data.blocks.length > 0 ? (
        <ArticleDynamicBlocks blocks={data.data.blocks} />
      ) : (
        <ArticleBlocks data={data.data} />
      )}
      {footer && <ArticleFooter data={data} />}
    </ArticleContainer>
  )
}

const ArticleContainer = styled.article`
  display: flex;
  position: relative;
  flex-direction: column;
  gap: 16px;
  max-width: 700px;
  padding-bottom: 80px;

  h2,
  h3 {
    margin-bottom: unset;
  }

  // p tag does not include strong tag as a child
  h3 + span + p {
    margin-top: 16px;
  }

  h3 + span + p:has(strong) {
    margin-top: unset;
  }

  /* h3 + span + p:has(strong) + span + p {
    margin-top: 16px;
  } */

  h2 + span + p {
    margin-top: 16px;
  }

  h2 + span + p:has(strong) {
    margin-top: unset;
  }

  /* h2 + span + p:has(strong) + span + p {
    margin-top: 16px;
  } */

  h2 + span + h3 {
    margin-top: unset;
  }
`
