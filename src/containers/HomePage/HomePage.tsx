import { Enum_Post_Type } from '@/lib/strapi/strapi.generated'
import { Typography } from '@acid-info/lsd-react'
import styled from '@emotion/styled'
import axios from 'axios'
import React, { useRef, useState } from 'react'
import { Calendar } from '../../components/Calendar'
import { Hero } from '../../components/Hero'
import { PodcastShowInfo } from '../../components/PodcastShowInfo'
import { PostsGrid } from '../../components/PostsGrid'
import {
  FEATURED_ARTICLES_LIMIT,
  FEATURED_EPISODES_LIMIT,
  PODCAST_SHOWS_INFO_DISPLAY_LIMIT,
  POSTS_TO_LOAD,
} from '../../configs/consts.configs'
import { uiConfigs } from '../../configs/ui.configs'
import { useAutoScrollToNewGridItem } from '../../hooks/useAutoScrollToNewGridItem'
import logger from '../../lib/logger'
import { LPE } from '../../types/lpe.types'
import { lsdUtils } from '../../utils/lsd.utils'
import { LoadMoreButton } from './LoadMoreButton'

type MoreData = {
  remainingHighlighted: LPE.Post.Document[]
  initialNonHighlightedCount: number
}

export type HomePageProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
> & {
  data: {
    tags: LPE.Tag.Document[]
    shows: LPE.Podcast.Show[]
    articles: LPE.Post.Document[]
    episodes: LPE.Post.Document[]
  }
  articlesMoreData: MoreData
  episodesMoreData: MoreData
  calendarEvents?: import('../../types/data.types').CalendarEvent[]
  calendarError?: string | null
}

const POSTS_GRID_CONFIG = {
  pattern: [{ cols: 1, size: 'large' as const }],
  breakpoints: [
    {
      breakpoint: 'xs' as const,
      pattern: [{ cols: 1, size: 'small' as const }],
    },
  ],
  isHoverable: true,
  isSubtitleVisible: false,
  isClickable: true,
}

const FeaturedContent: React.FC<{
  posts: LPE.Post.Document[]
  shows: LPE.Podcast.Show[]
  variant: 'first' | 'second'
  gridRef?: React.Ref<HTMLDivElement>
}> = ({ posts, shows, variant, gridRef }) => {
  if (!posts.length) return null

  const StyledWrapper = variant === 'first' ? FeaturedFirst : FeaturedSecond

  return (
    <StyledWrapper>
      <PostsGrid
        {...POSTS_GRID_CONFIG}
        shows={shows}
        posts={posts}
        ref={gridRef}
      />
    </StyledWrapper>
  )
}

export const HomePage: React.FC<HomePageProps> = ({
  data,
  data: { articles = [], shows = [], tags: _tags = [], episodes = [] },
  articlesMoreData,
  episodesMoreData,
  calendarEvents = [],
  calendarError,
  ...props
}) => {
  const [displayedItems, setDisplayedItems] = useState({
    articles,
    episodes,
  })

  const [firstFeaturedPost, ...secondFeaturedPosts] = displayedItems.articles
  const [featuredEpisode, ...remainingEpisodes] = displayedItems.episodes

  const articlesGridRef = useRef<HTMLDivElement>(null)
  const episodesGridRef = useRef<HTMLDivElement>(null)

  useAutoScrollToNewGridItem(secondFeaturedPosts, articlesGridRef)
  useAutoScrollToNewGridItem(remainingEpisodes, episodesGridRef)

  const [remainingHighlighted, setRemainingHighlighted] = useState({
    articles: articlesMoreData.remainingHighlighted,
    episodes: episodesMoreData.remainingHighlighted,
  })

  const [hasMore, setHasMore] = useState({
    articles:
      articlesMoreData.remainingHighlighted.length > 0 ||
      articles.length === FEATURED_ARTICLES_LIMIT,
    episodes:
      episodesMoreData.remainingHighlighted.length > 0 ||
      episodes.length === FEATURED_EPISODES_LIMIT,
  })
  const [loading, setLoading] = useState({ articles: false, episodes: false })

  const [nonHighlightedCount, setNonHighlightedCount] = useState({
    articles: articlesMoreData.initialNonHighlightedCount,
    episodes: episodesMoreData.initialNonHighlightedCount,
  })

  const fetchMore = async (type: Enum_Post_Type) => {
    const isArticle = type === 'Article'
    const key = isArticle ? 'articles' : 'episodes'

    setLoading((prev) => ({ ...prev, [key]: true }))

    try {
      const currentRemainingHighlighted = remainingHighlighted[key]
      let postsToAdd: LPE.Post.Document[] = []

      if (currentRemainingHighlighted.length > 0) {
        postsToAdd = currentRemainingHighlighted.slice(0, POSTS_TO_LOAD)
        const stillRemaining = currentRemainingHighlighted.slice(POSTS_TO_LOAD)
        setRemainingHighlighted((prev) => ({ ...prev, [key]: stillRemaining }))
      }

      const postsNeededFromApi = POSTS_TO_LOAD - postsToAdd.length

      if (postsNeededFromApi > 0) {
        const currentNonHighlightedCount = nonHighlightedCount[key]
        const response = await axios.get('/api/posts', {
          params: {
            skip: currentNonHighlightedCount,
            limit: postsNeededFromApi,
            type,
          },
        })
        const newPostsFromApi = response.data.data.data
        postsToAdd = [...postsToAdd, ...newPostsFromApi]

        setNonHighlightedCount((prev) => ({
          ...prev,
          [key]: prev[key] + newPostsFromApi.length,
        }))

        if (newPostsFromApi.length < postsNeededFromApi) {
          setHasMore((prev) => ({ ...prev, [key]: false }))
        }
      }

      setDisplayedItems((prev) => ({
        ...prev,
        [key]: [...prev[key], ...postsToAdd],
      }))
    } catch (error) {
      logger.debug('Fetch more posts failed', {
        key,
        type,
        error,
        errorType: typeof error,
        currentItems: displayedItems[key]?.length || 0,
      })
      logger.error('Error fetching more posts', { key, error })
    } finally {
      setLoading((prev) => ({ ...prev, [key]: false }))
    }
  }

  return (
    <Root {...props}>
      <HeroContainer>
        <Hero />
      </HeroContainer>
      <Container>
        <div>
          <FeaturedContent
            posts={[firstFeaturedPost]}
            shows={shows}
            variant="first"
          />
          <FeaturedContent
            posts={secondFeaturedPosts}
            shows={shows}
            variant="second"
            gridRef={articlesGridRef}
          />
          {hasMore.articles && (
            <LoadMoreButton
              onClick={() => fetchMore('Article')}
              disabled={loading.articles}
              loading={loading.articles}
            />
          )}
        </div>

        <div>
          <PodcastsSection>
            <div className="podcasts__header">
              <Typography component="h2" variant="h2">
                Podcasts
              </Typography>
            </div>
            <div className="podcasts__all-shows-info">
              {shows.slice(0, PODCAST_SHOWS_INFO_DISPLAY_LIMIT).map((show) => (
                <PodcastShowInfo key={show.id} show={show} />
              ))}
            </div>
          </PodcastsSection>

          <PodcastsContent>
            <FeaturedContent
              posts={[featuredEpisode]}
              shows={shows}
              variant="first"
            />
            <FeaturedContent
              posts={remainingEpisodes}
              shows={shows}
              variant="second"
              gridRef={episodesGridRef}
            />
            {hasMore.episodes && (
              <LoadMoreButton
                onClick={() => fetchMore('Episode')}
                disabled={loading.episodes}
                loading={loading.episodes}
              />
            )}
          </PodcastsContent>

          <CalendarSection>
            <div className="calendar__header">
              <Typography component="h2" variant="h2">
                Calendar
              </Typography>
            </div>
            <Calendar events={calendarEvents} error={calendarError} />
          </CalendarSection>
        </div>
      </Container>
    </Root>
  )
}

const Root = styled('div')`
  width: 100%;
  display: flex;
  flex-direction: column;

  .load-more {
    width: 100%;
    text-align: center;
    margin-top: var(--lsd-spacing-24);

    ${(props) => lsdUtils.breakpoint(props.theme, 'xs', 'exact')} {
      margin-top: var(--lsd-spacing-16);

      button {
        width: 100%;
      }
    }
  }
`

const HeroContainer = styled.div`
  ${(props) => lsdUtils.breakpoint(props.theme, 'xs', 'exact')} {
    & > div:last-of-type {
      padding-left: 0;
      padding-right: 0;
    }
  }
`

const Container = styled.div`
  @media (max-width: ${uiConfigs.maxContainerWidth}px) {
    padding: 0 var(--main-content-padding);
  }

  display: flex;
  flex-direction: column;
  gap: 200px;

  .post-card-wrapper {
    border-top: none;
  }

  ${(props) => lsdUtils.breakpoint(props.theme, 'sm', 'up')} {
    .post-card-wrapper {
      border-top: 1px solid rgb(var(--lsd-border-primary));
    }
  }
`

const FeaturedFirst = styled.div`
  ${(props) => lsdUtils.breakpoint(props.theme, 'xs', 'exact')} {
    .post-card {
      padding-bottom: 0 !important;
    }

    .post-card__label *,
    .post-card__authors-label * {
      font-size: 12px !important;
      line-height: 16px !important;
    }

    .post-card__authors-label {
      margin-top: var(--lsd-spacing-4) !important;
    }

    .post-card__label {
      margin-top: var(--lsd-spacing-32) !important;
    }

    .post-card__title-text {
      margin-top: var(--lsd-spacing-8);
    }
  }

  ${(props) => lsdUtils.breakpoint(props.theme, 'lg', 'up')} {
    .post-card__cover-image {
      & > div {
        padding-top: 379px !important;
      }
    }
  }

  ${(props) => lsdUtils.breakpoint(props.theme, 'sm', 'up')} {
    .post-card {
      gap: 0 var(--lsd-spacing-16) !important;
    }

    .show-details {
      margin-top: var(--lsd-spacing-32) !important;
    }

    .post-card__title-text {
      font-size: 40px !important;
      line-height: 48px !important;
    }

    .post-card-wrapper > div {
      gap: 0 64px !important;
    }
  }
`

const FeaturedSecond = styled.div`
  .post-card {
    gap: var(--lsd-spacing-16) !important;
  }

  .post-card__title-text {
    font-size: 32px !important;
    line-height: 40px !important;
  }

  .post-card__label *,
  .post-card__authors-label * {
    font-size: 12px !important;
    line-height: 16px !important;
  }

  .post-card__cover-image-wrapper {
    display: flex;
    justify-content: flex-end;

    .post-card__cover-image {
      display: block;
      width: calc(2 / 3 * 100%) !important;
    }
  }

  ${(props) => lsdUtils.breakpoint(props.theme, 'lg', 'up')} {
    .post-card__cover-image {
      & > div {
        padding-top: 241px !important;
      }
    }
  }

  ${(props) => lsdUtils.breakpoint(props.theme, 'xs', 'exact')} {
    margin-top: var(--lsd-spacing-40);

    .post-card {
      gap: 0 !important;
      padding-bottom: 0 !important;
      height: 100%;
    }

    .row {
      margin-right: -16px;
      padding-right: 16px;
      gap: var(--lsd-spacing-16);
      padding-bottom: var(--lsd-spacing-8);
    }

    .post-card__title-text {
      font-size: 1.25rem !important;
      line-height: 1.75rem !important;
      margin-top: var(--lsd-spacing-8);
    }

    .post-card__authors-label {
      margin-top: var(--lsd-spacing-4) !important;
    }

    .post-card__label {
      margin-top: var(--lsd-spacing-32) !important;
    }

    .post-card-wrapper {
      width: 327px;

      & > div {
        width: 327px;
      }
    }

    .post-card__cover-image-wrapper {
      display: flex;
      justify-content: flex-end;

      .post-card__cover-image {
        width: 100% !important;
      }
    }

    & > div > div {
      display: flex !important;
      overflow-x: auto !important;
    }
  }
`

const PodcastsSection = styled.div`
  .podcasts__header {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .podcasts__all-shows-info {
    display: flex;
    flex-direction: row;
    gap: var(--lsd-spacing-16);
    margin-top: var(--lsd-spacing-24);
    margin-bottom: 120px;
  }

  ${(props) => lsdUtils.breakpoint(props.theme, 'xs', 'exact')} {
    .podcasts__header {
      border-bottom: none;

      h2 {
        ${lsdUtils.typography('h3')}
      }
    }
  }
`

const PodcastsContent = styled.div``

const CalendarSection = styled.div`
  margin-top: 200px;

  .calendar__header {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding-bottom: var(--lsd-spacing-24);
    border-bottom: 1px solid rgb(var(--lsd-border-primary));
    margin-bottom: var(--lsd-spacing-24);
  }

  ${(props) => lsdUtils.breakpoint(props.theme, 'xs', 'exact')} {
    .calendar__header {
      border-bottom: none;

      h2 {
        ${lsdUtils.typography('h3')}
      }
    }
  }
`
