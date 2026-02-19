import { ArticleReference } from '@/components/ArticleReference'
import { Collapse } from '@/components/Collapse'
import { LPE } from '../../../types/lpe.types'

const FromSameAuthorsArticles = ({
  data,
  keepBorderTop = false,
}: {
  data: LPE.Article.Metadata[]
  keepBorderTop?: boolean
}) =>
  data.length > 0 ? (
    <Collapse
      {...(keepBorderTop ? { 'data-keep-border-top': 'true' } : {})}
      label="From The Same Authors"
    >
      {data.map((article, idx) => (
        <ArticleReference key={idx} data={article} />
      ))}
    </Collapse>
  ) : null

export default FromSameAuthorsArticles
