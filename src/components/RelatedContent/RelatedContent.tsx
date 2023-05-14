import styled from '@emotion/styled'
import { SearchHook, SearchResultItem } from '@/types/data.types'
import { UnbodyImageBlock, UnbodyTextBlock } from '@/lib/unbody/unbody.types'
import { Grid } from '../Grid/Grid'
import { ImageBlock, TextBlock } from '../ContentBlock'
import { UnbodyGraphQl } from '@/lib/unbody/unbody-content.types'
import { SearchResultsSection } from '@/components/SearchResultsSection/SearchResultsSection'

type Props = {
  data: SearchHook<UnbodyTextBlock | UnbodyImageBlock>
}
export default function RelatedContent({ data }: Props) {
  return (
    <Container>
      <SearchResultsSection
        resultSize={data.data.length}
        loading={data.loading}
        title={'Related Content'}
      >
        <Grid>
          {data.data.map(
            (block: SearchResultItem<UnbodyImageBlock | UnbodyTextBlock>) => {
              if (!block.doc.document || !block.doc.document[0]) return null

              let refArticle = null
              if (UnbodyGraphQl.UnbodyDocumentTypeNames.GoogleDoc) {
                refArticle = block.doc.document[0]
              }
              switch (block.doc.__typename) {
                case UnbodyGraphQl.UnbodyDocumentTypeNames.TextBlock:
                  return <TextBlock doc={block.doc} />
                case UnbodyGraphQl.UnbodyDocumentTypeNames.ImageBlock: {
                  return <ImageBlock doc={block.doc} />
                }
              }
            },
          )}
        </Grid>
      </SearchResultsSection>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 108px;

  @media (max-width: 768px) {
    align-items: flex-start;
  }
`
