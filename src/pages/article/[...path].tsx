import { SEO } from '@/components/SEO'
import ArticleContainer from '@/containers/ArticleContainer'
import { GetStaticPropsContext } from 'next'
import { strapiApi } from '../../services/strapi'
import { LPE } from '../../types/lpe.types'

type ArticleProps = {
  data: LPE.Article.Document
  errors: string | null
  why?: string
}

const ArticlePage = ({ data, errors, why }: ArticleProps) => {
  if (!data) return null
  if (errors) return <div>{errors}</div>

  return (
    <>
      <SEO
        title={data.data.title}
        description={data.data.summary}
        noIndex={data.data.isDraft}
        image={data.data.coverImage}
        pagePath={`/article/${data.data.slug}`}
        date={data.data.createdAt}
        tags={[
          ...data.data.tags.map((tag) => tag.name),
          ...data.data.authors.map((author) => author.name),
        ]}
        contentType={LPE.PostTypes.Article}
        authors={data.data.authors.map((author) => author.name)}
      />
      <ArticleContainer data={data} />
    </>
  )
}

export async function getStaticPaths() {
  const { data, errors } = await strapiApi.getPosts({
    skip: 0,
    limit: 50,
    highlighted: 'include',
    parseContent: false,
    published: true,
  })

  return {
    paths: errors
      ? []
      : (data?.data || []).map((post) => ({ params: { path: [post.slug] } })),
    fallback: true,
  }
}

export const getStaticProps = async ({ params }: GetStaticPropsContext) => {
  const { path } = params || {}
  const [slug, idProp, id] = (Array.isArray(path) && path) || []

  if (idProp && (idProp !== 'id' || !id)) {
    return {
      notFound: true,
      props: {},
    }
  }

  if (!slug) {
    return {
      notFound: true,
      props: { why: 'no slug' },
    }
  }

  const { data: res, errors } = await strapiApi.getPosts({
    parseContent: true,
    slug: slug as string,
    highlighted: 'include',
    published: true,
    ...(id ? { id, published: false } : {}),
  })

  if (!res?.data || res.data.length === 0) {
    return {
      notFound: true,
      props: { why: 'no article' },
      revalidate: 10,
    }
  }

  const article = res.data[0]

  const { data: relatedArticles } = await strapiApi.getRelatedPosts({
    id: article.id,
    type: 'article',
  })

  const { data: articlesFromSameAuthors } =
    await strapiApi.getPostsFromSameAuthors({
      type: 'article',
      excludeId: article.id,
      authors: article.authors.map((author) => author.id),
    })

  return {
    props: {
      data: {
        data: article,
        relatedArticles: relatedArticles || [],
        articlesFromSameAuthors: articlesFromSameAuthors?.data || [],
      },
      error: JSON.stringify(errors),
    },
    revalidate: 10,
  }
}

export default ArticlePage
