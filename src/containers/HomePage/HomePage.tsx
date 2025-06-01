import { useIsMobile } from '@/utils/ui.utils'
import { ChevronRightIcon, Typography } from '@acid-info/lsd-react'
import styled from '@emotion/styled'
import React, { useEffect, useMemo } from 'react'
import { Grid, GridItem } from '../../components/Grid/Grid'
import { Hero } from '../../components/Hero'
import { PostsGrid } from '../../components/PostsGrid'
import { Section } from '../../components/Section/Section'
import { TagCard } from '../../components/TagCard'
import { uiConfigs } from '../../configs/ui.configs'
import { useRecentPosts } from '../../queries/useRecentPosts.query'
import { ApiPaginatedPayload } from '../../types/data.types'
import { LPE } from '../../types/lpe.types'
import { lsdUtils } from '../../utils/lsd.utils'
import { formatTagText } from '../../utils/string.utils'
import { PodcastShowsPreview } from '../PodcastShowsPreview'

export type HomePageProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
> & {
  data: {
    tags: LPE.Tag.Document[]
    shows: LPE.Podcast.Show[]
    latest: ApiPaginatedPayload<LPE.Post.Document[]>
    highlighted: LPE.Post.Document[]
  }
}

const TAGS_DESKTOP_LIMIT = 12
const TAGS_MOBILE_LIMIT = 6

export const HomePage: React.FC<HomePageProps> = ({
  data,
  data: { highlighted = [], shows = [], tags: _tags = [], latest },
  ...props
}) => {
  const query = useRecentPosts({ initialData: latest, limit: 12 })
  const tags = useMemo(
    () =>
      _tags
        .filter((t) => !!t.postsCount && t.postsCount > 0)
        .sort((a, b) => (a.postsCount! > b.postsCount! ? -1 : 1)),
    [_tags],
  )
  const isMobile = useIsMobile()

  const [tagsLimit, setTagsLimit] = React.useState(
    isMobile ? TAGS_MOBILE_LIMIT : TAGS_DESKTOP_LIMIT,
  )

  useEffect(() => {
    setTagsLimit(isMobile ? TAGS_MOBILE_LIMIT : TAGS_DESKTOP_LIMIT)
  }, [isMobile])

  const handleTagsLimit = () => {
    if (isMobile) {
      setTagsLimit(
        tagsLimit === TAGS_MOBILE_LIMIT ? tags?.length : TAGS_MOBILE_LIMIT,
      )
    } else {
      setTagsLimit(
        tagsLimit === TAGS_DESKTOP_LIMIT ? tags?.length : TAGS_DESKTOP_LIMIT,
      )
    }
  }

  const firstFeaturedPost =
    highlighted.sort(
      (a, b) =>
        new Date(b.publishedAt as string).getTime() -
        new Date(a.publishedAt as string).getTime(),
    )[0] ?? highlighted[0]

  const secondFeaturedPosts = highlighted.filter(
    (post) => post.id !== firstFeaturedPost?.id,
  ) ?? [highlighted[1], highlighted[2]]

  return (
    <Root {...props}>
      <HeroContainer>
        <Hero />
      </HeroContainer>
      <Container>
        <div>
          <FeaturedFirst>
            <PostsGrid
              isHoverable
              shows={shows}
              posts={[firstFeaturedPost]}
              pattern={[{ cols: 1, size: 'large' }]}
              breakpoints={[
                {
                  breakpoint: 'xs',
                  pattern: [{ cols: 1, size: 'small' }],
                },
                {
                  breakpoint: 'md',
                  pattern: [{ cols: 1, size: 'large' }],
                },
              ]}
            />
          </FeaturedFirst>
          <FeaturedSecond>
            <PostsGrid
              isHoverable
              shows={shows}
              posts={secondFeaturedPosts}
              pattern={[{ cols: 1, size: 'large' }]}
              breakpoints={[
                {
                  breakpoint: 'xs',
                  pattern: [{ cols: 2, size: 'small' }],
                },
              ]}
            />
          </FeaturedSecond>
        </div>

        <PodcastShowsPreview data={{ shows }} />

        <BrowseAll title="Browse all" size="large">
          <TagsTitle>
            <Typography component="h2" variant="body1">
              Tags
            </Typography>
            <ChevronRightIcon />
            <span onClick={handleTagsLimit}>
              {tagsLimit === TAGS_DESKTOP_LIMIT ||
              tagsLimit === TAGS_MOBILE_LIMIT
                ? 'See all'
                : 'See less'}
            </span>
          </TagsTitle>
          <Grid xs={{ cols: 1 }} sm={{ cols: 4 }}>
            {tags?.slice(0, tagsLimit)?.map((tag) => (
              <GridItem key={tag.name} cols={1}>
                <TagCard
                  href={`/search?topic=${tag.name}`}
                  name={formatTagText(tag.name)}
                  count={tag.postsCount}
                />
              </GridItem>
            ))}
          </Grid>
          <ShowMoreTagsButton onClick={handleTagsLimit}>
            See {tagsLimit === TAGS_MOBILE_LIMIT ? 'more' : 'less'} tags
          </ShowMoreTagsButton>
        </BrowseAll>
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
  gap: var(--lsd-spacing-120) 0;

  ${(props) => lsdUtils.breakpoint(props.theme, 'xs', 'exact')} {
    gap: var(--lsd-spacing-80) 0;
  }
`

const BrowseAll = styled(Section)`
  & > .section__content {
    & > div:first-of-type {
      padding: var(--lsd-spacing-24) 0;
    }
  }
`

const TagsTitle = styled.div`
  display: flex;
  align-items: center;
  gap: var(--lsd-spacing-8);

  span {
    cursor: pointer;
    color: var(--lsd-color-primary);
    text-decoration: underline;
  }
`

const ShowMoreTagsButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 40px;
  border: 1px solid rgb(var(--lsd-border-primary));
  margin-top: 40px;
  height: 56px;
  box-sizing: border-box;

  margin-bottom: 66px;

  ${(props) => lsdUtils.breakpoint(props.theme, 'sm', 'up')} {
    display: none;
  }
`

const FeaturedFirst = styled.div`
  ${(props) => lsdUtils.breakpoint(props.theme, 'sm', 'up')} {
    .post-card {
      gap: 0 var(--lsd-spacing-16) !important;
    }

    .show-details {
      margin-top: var(--lsd-spacing-32) !important;
    }

    .post-card__title h3 {
      font-size: var(--lsd-h2-fontSize) !important;
      line-height: var(--lsd-h2-lineHeight) !important;
    }

    .post-card__subtitle {
      margin-top: var(--lsd-spacing-16) !important;
    }

    .post-card-wrapper > div {
      gap: 0 64px !important;
    }
  }
`

const FeaturedSecond = styled.div`
  margin-bottom: var(--lsd-spacing-64);

  .post-card {
    gap: 0 var(--lsd-spacing-16) !important;
  }

  .post-card__title-text {
    font-size: var(--lsd-h4-fontSize) !important;
    line-height: var(--lsd-h4-lineHeight) !important;
  }

  .post-card__label {
    margin-top: var(--lsd-spacing-16) !important;
  }

  .post-card__label * {
    font-size: var(--lsd-subtitle4-fontSize) !important;
    line-height: var(--lsd-subtitle4-lineHeight) !important;
  }

  .post-card__subtitle {
    margin-top: var(--lsd-spacing-16) !important;
    font-size: var(--lsd-subtitle4-fontSize) !important;
    font-weight: var(--lsd-subtitle4-fontWeight) !important;
    line-height: var(--lsd-subtitle4-lineHeight) !important;
  }

  .post-card-wrapper {
    border-top: 1px solid rgb(var(--lsd-border-primary));
  }

  ${(props) => lsdUtils.breakpoint(props.theme, 'xs', 'exact')} {
    margin-top: var(--lsd-spacing-40);
    margin-bottom: var(--lsd-spacing-80);

    .row {
      margin-right: -16px;
      padding-right: 16px;
    }

    .post-card-wrapper {
      width: 327px;

      & > div {
        width: 327px;
      }
    }

    & > div > div {
      display: flex !important;
      overflow-x: auto !important;
    }
  }
`
