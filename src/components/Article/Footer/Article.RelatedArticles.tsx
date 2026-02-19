import { ArticleReference } from '@/components/ArticleReference'
import { Collapse } from '@/components/Collapse'
import { LPE } from '../../../types/lpe.types'

const ArticleRelatedArticles = ({
  data,
  keepBorderTop = false,
}: {
  data: LPE.Article.Metadata[]
  keepBorderTop?: boolean
}) =>
  data.length > 0 ? (
    <Collapse
      {...(keepBorderTop ? { 'data-keep-border-top': 'true' } : {})}
      label="Related Articles"
    >
      {data.map((article, idx) => (
        <ArticleReference key={idx} data={article} />
      ))}
    </Collapse>
  ) : null

export default ArticleRelatedArticles
