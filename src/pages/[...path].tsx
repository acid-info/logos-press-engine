import { CustomNextPage, GetStaticPaths, GetStaticProps } from 'next'
import { SEO } from '../components/SEO'
import { StaticPage, StaticPageProps } from '../containers/StaticPage'
import { strapiApi } from '../services/strapi'

type PageProps = Pick<StaticPageProps, 'data'> & {}

const Page: CustomNextPage<PageProps> = ({ data, ...props }) => {
  return (
    <>
      <SEO
        title={data?.page?.title}
        description={data?.page?.subtitle}
        noIndex={data?.page?.isDraft}
        pagePath={`/${data?.page?.slug}`}
      />
      {data && <StaticPage data={data} />}
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const { data } = await strapiApi.getStaticPages({})

  return {
    paths: (data || []).map((page) => ({
      params: {
        path: [page.slug],
      },
    })),
    fallback: true,
  }
}

export const getStaticProps: GetStaticProps<PageProps> = async (ctx) => {
  const { path } = ctx.params || {}
  const [slug, idProp, id] = (Array.isArray(path) && path) || []

  if (idProp && (idProp !== 'id' || !id)) {
    return {
      notFound: true,
      props: {},
    }
  }

  const { data, errors } = await strapiApi.getStaticPages({
    parseContent: true,
    slug: slug as string,
    ...(id
      ? {
          id,
          published: false,
        }
      : {}),
  })

  if (errors) {
    throw errors
  }

  if ((data || []).length === 0) {
    return {
      notFound: true,
      revalidate: 10,
    }
  }

  return {
    props: {
      data: {
        page: data[0],
      },
    },
    notFound: false,
    revalidate: 10,
  }
}

export default Page
