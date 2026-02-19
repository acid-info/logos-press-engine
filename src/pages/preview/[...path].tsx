import { CustomNextPage, GetServerSideProps } from 'next'
import { SEO } from '../../components/SEO'
import { strapiApi } from '../../services/strapi'
import { LPE } from '../../types/lpe.types'
import { getPostLink } from '../../utils/route.utils'

type PageProps = {}

const Page: CustomNextPage<PageProps> = (props) => {
  return (
    <>
      <SEO />
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const path = ctx.query.path
  console.log('Preview path:', path, Array.isArray(path), path?.length)
  if (!path || !Array.isArray(path) || path.length !== 2)
    return {
      notFound: true,
    }

  const type = path[0]
  const id = path[1]

  if (!['page', 'post'].includes(type))
    return {
      notFound: true,
    }

  if (type === 'post') {
    const { data: shows } = await strapiApi.getPodcastShows({
      populateEpisodes: false,
    })

    const {
      data: { data = [] },
    } = await strapiApi.getPosts({
      slug: id,
      published: false,
      parseContent: false,
    })

    const post = data?.[0]
    if (post) {
      return {
        props: {},
        redirect: {
          destination: getPostLink(post.type, {
            id: post.id,
            postSlug: post.slug,
            showSlug:
              (post.type === 'podcast' &&
                shows.find(
                  (show) => show.id === (post as LPE.Podcast.Document).showId,
                )?.slug) ||
              '',
          }),
          permanent: false,
        },
        notFound: false,
      }
    }
  } else if (type === 'page') {
    const { data: pages } = await strapiApi.getStaticPages({
      slug: id,
      published: false,
      parseContent: false,
    })

    const page = pages?.[0]

    if (page) {
      return {
        props: {},
        redirect: {
          destination: getPostLink(page.type, {
            id: page.id,
            postSlug: page.slug,
          }),
          permanent: false,
        },
        notFound: false,
      }
    }
  }

  return {
    notFound: true,
  }
}

export default Page
