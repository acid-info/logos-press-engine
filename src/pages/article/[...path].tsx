import { SEO } from '@/components/SEO'
import ArticleContainer from '@/containers/ArticleContainer'
import { parseHtmlDocument } from '@/utils/html-document.utils'
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
    console.warn('[ArticlePage] Invalid route params for article page', {
      path,
      idProp,
      id,
    })
    return {
      notFound: true,
    }
  }

  if (!slug) {
    console.warn('[ArticlePage] Missing article slug; returning notFound')
    return {
      notFound: true,
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
    console.warn(
      '[ArticlePage] No article found for slug; returning notFound',
      {
        slug,
        id,
      },
    )
    return {
      notFound: true,
      revalidate: 10,
    }
  }

  const article = res.data[0]

  if (article.type !== LPE.PostTypes.Article) {
    console.warn(
      '[ArticlePage] Resolved post is not an article; returning notFound',
      {
        slug,
        id,
        postType: article.type,
      },
    )
    return {
      notFound: true,
      revalidate: 10,
    }
  }

  if (article.htmlFile?.url) {
    const rawUrl = article.htmlFile.url
    const isAbsolute = /^https?:\/\//i.test(rawUrl)
    const configuredBase =
      process.env.NEXT_PUBLIC_ASSETS_BASE_URL || process.env.STRAPI_API_URL
    let resolvedUrl: string | null = null

    if (isAbsolute) {
      resolvedUrl = rawUrl
    } else if (configuredBase) {
      try {
        const baseOrigin = new URL(configuredBase).origin
        resolvedUrl = new URL(rawUrl, baseOrigin).toString()
      } catch (error) {
        console.warn(
          '[ArticlePage] Failed to resolve htmlFile.url due to invalid base URL configuration',
          { rawUrl, configuredBase, error },
        )
      }
    } else {
      console.warn(
        '[ArticlePage] Failed to resolve relative htmlFile.url: NEXT_PUBLIC_ASSETS_BASE_URL or STRAPI_API_URL must be set',
        { rawUrl },
      )
    }

    if (resolvedUrl) {
      try {
        const response = await fetch(resolvedUrl)
        if (response.ok) {
          const html = await response.text()
          article.htmlDocument = parseHtmlDocument(html)
        } else {
          console.warn('[ArticlePage] Failed to fetch html document', {
            rawUrl,
            resolvedUrl,
            status: response.status,
            statusText: response.statusText,
          })
        }
      } catch (error) {
        console.warn('[ArticlePage] Failed to fetch html document', {
          rawUrl,
          resolvedUrl,
          error,
        })
      }
    }
  }

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
