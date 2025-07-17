import { ArticleReference } from '@/components/ArticleReference'
import { Collapse } from '@/components/Collapse'
import { LPE } from '../../../types/lpe.types'

const ArticleRelatedArticles = ({ data }: { data: LPE.Article.Metadata[] }) =>
  data.length > 0 ? (
    <Collapse className="related-articles" label="Related Articles">
      {data.map((article, idx) => (
        <ArticleReference key={idx} data={article} />
      ))}
    </Collapse>
  ) : null

export default ArticleRelatedArticles
