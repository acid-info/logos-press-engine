import styled from '@emotion/styled'
import { LPE } from '../../types/lpe.types'
import ArticleBlocks from './Article.Blocks'
import ArticleDynamicBlocks from './Article.DynamicBlocks'
import ArticleHtmlDocument from './Article.HtmlDocument'
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
    <ArticleContainer hasHtmlDocument={!!data.data.htmlDocument}>
      {data.data.htmlDocument ? (
        <HTMLDocumentContainer>
          {header && <ArticleHeader {...data.data} />}
          <FullWidthContainer>
            <ArticleHtmlDocument doc={data.data.htmlDocument} />
          </FullWidthContainer>
        </HTMLDocumentContainer>
      ) : (
        <>
          {header && <ArticleHeader {...data.data} />}
          {data.data.blocks && data.data.blocks.length > 0 ? (
            <ArticleDynamicBlocks blocks={data.data.blocks} />
          ) : (
            <ArticleBlocks data={data.data} />
          )}
          {footer && <ArticleFooter data={data} />}
        </>
      )}
    </ArticleContainer>
  )
}

const ArticleContainer = styled.article<{ hasHtmlDocument: boolean }>`
  display: flex;
  position: relative;
  flex-direction: column;
  gap: 16px;
  max-width: 700px;
  margin: ${(props) => (props.hasHtmlDocument ? '0 auto' : '0')};
  padding-bottom: var(--global-audio-player-height, 80px);

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

const FullWidthContainer = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  max-width: none;
  margin: 0;
  padding: 0;

  > * {
    width: 100%;
  }
`

const HTMLDocumentContainer = styled.div`
  @media (max-width: 768px) {
    padding-inline: 16px;
    padding-top: 48px;
  }
`
