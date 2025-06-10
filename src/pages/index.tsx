import { LPERssFeed } from '@/services/rss.service'
import { CustomNextPage, GetStaticProps } from 'next'
import SEO from '../components/SEO/SEO'
import { HomePage, HomePageProps } from '../containers/HomePage'
import { DefaultLayout } from '../layouts/DefaultLayout'
import { Enum_Post_Type } from '../lib/strapi/strapi.generated'
import { strapiApi } from '../services/strapi'

type PageProps = Pick<HomePageProps, 'data'>

const FEATURED_ARTICLES_LIMIT = 4
const FEATURED_EPISODES_LIMIT = 4

const Page: CustomNextPage<PageProps> = (props) => {
  return (
    <>
      <SEO rssFileName={'main.rss'} />
      <HomePage data={props.data} />
    </>
  )
}

Page.getLayout = function getLayout(page: React.ReactNode) {
  return (
    <DefaultLayout
      mainProps={{ spacing: false, contentPadding: false }}
      navbarProps={{ defaultState: { showTitle: false } }}
    >
      {page}
    </DefaultLayout>
  )
}

export const getStaticProps: GetStaticProps<PageProps> = async () => {
  const { data: highlightedArticlesResponse } = await strapiApi.getPosts({
    highlighted: 'only',
    filters: {
      type: {
        eq: 'Article' as Enum_Post_Type,
      },
    },
    limit: FEATURED_ARTICLES_LIMIT,
  })

  const highlightedArticles = highlightedArticlesResponse.data
  const articlesNeeded = FEATURED_ARTICLES_LIMIT - highlightedArticles.length

  let nonHighlightedArticles: any[] = []
  if (articlesNeeded > 0) {
    const { data: nonHighlightedResponse } = await strapiApi.getPosts({
      highlighted: 'exclude',
      filters: {
        type: {
          eq: 'Article' as Enum_Post_Type,
        },
      },
      limit: articlesNeeded,
    })
    nonHighlightedArticles = nonHighlightedResponse.data
  }

  const { data: highlightedEpisodesResponse } = await strapiApi.getPosts({
    highlighted: 'only',
    filters: {
      type: {
        eq: 'Episode' as Enum_Post_Type,
      },
    },
    limit: FEATURED_EPISODES_LIMIT,
  })

  const highlightedEpisodes = highlightedEpisodesResponse.data
  const episodesNeeded = FEATURED_EPISODES_LIMIT - highlightedEpisodes.length

  let nonHighlightedEpisodes: any[] = []
  if (episodesNeeded > 0) {
    const { data: nonHighlightedResponse } = await strapiApi.getPosts({
      highlighted: 'exclude',
      filters: {
        type: {
          eq: 'Episode' as Enum_Post_Type,
        },
      },
      limit: episodesNeeded,
    })
    nonHighlightedEpisodes = nonHighlightedResponse.data
  }

  const featuredArticles = [...highlightedArticles, ...nonHighlightedArticles]
  const featuredEpisodes = [
    ...highlightedEpisodes,
    ...nonHighlightedEpisodes,
  ].slice(0, FEATURED_EPISODES_LIMIT)

  const { data: _shows = [] } = await strapiApi.getPodcastShows({})

  const shows = [...(_shows ?? [])].sort((a, b) => (a.title > b.title ? -1 : 1))

  const { data: tags = [] } = await strapiApi.getTopics()

  try {
    const rss = new LPERssFeed('main')
    await rss.init()
    featuredArticles.forEach((post) => rss.addPost(post))
    await rss.save()
  } catch (e) {
    console.log('Error generating RSS feed', e)
  }

  return {
    props: {
      data: {
        tags,
        shows,
        articles: featuredArticles.slice(0, FEATURED_ARTICLES_LIMIT),
        episodes: featuredEpisodes,
      },
    },
    revalidate: 10,
  }
}

export default Page
