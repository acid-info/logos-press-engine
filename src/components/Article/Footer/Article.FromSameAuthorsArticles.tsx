import { ArticleReference } from '@/components/ArticleReference'
import { Collapse } from '@/components/Collapse'
import { LPE } from '../../../types/lpe.types'
import styles from '../Article.module.css'

const FromSameAuthorsArticles = ({ data }: { data: LPE.Article.Metadata[] }) =>
  data.length > 0 ? (
    <Collapse
      className={styles.relatedArticles}
      data-keep-border-top="true"
      label="From The Same Authors"
    >
      {data.map((article, idx) => (
        <ArticleReference key={idx} data={article} />
      ))}
    </Collapse>
  ) : null

export default FromSameAuthorsArticles
