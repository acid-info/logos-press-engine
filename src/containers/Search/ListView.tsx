import { Grid, GridItem } from '@/components/Grid/Grid'
import { SearchResultTopPost } from '@/components/Search/SearchResult.TopPost'
import { SearchResultListPosts } from '@/components/Search/SearchResultList.Posts'
import { copyConfigs } from '@/configs/copy.configs'
import { uiConfigs } from '@/configs/ui.configs'
import { LPE } from '@/types/lpe.types'
import { lsdUtils } from '@/utils/lsd.utils'
import { Button, Typography } from '@acid-info/lsd-react'
import styled from '@emotion/styled'
import { useMemo } from 'react'
import { Section } from '../../components/Section/Section'

interface Props {
  posts: LPE.Search.ResultItemBase<LPE.Post.Document>[]
  blocks: LPE.Search.ResultItemBase<LPE.Post.ContentBlock>[]
  shows: LPE.Podcast.Show[]
  busy: boolean
  showTopPost: boolean
  hasMore?: boolean
  onLoadMore?: () => void
  selectedTypes?: string[]
}

export const SearchResultsListView = (props: Props) => {
  const {
    posts,
    shows,
    blocks,
    busy,
    showTopPost,
    hasMore,
    onLoadMore,
    selectedTypes = [],
  } = props

  const mostReferredPostIndex = useMemo(() => {
    if (!showTopPost) return -1
    // Extract the IDs of the first 3 posts
    const firstThreePostIds = posts.slice(0, 3).map((post) => post.data.id)

    // Count occurrences of each post id from the blocks,
    // but only for the first 3 posts
    const postCounts = blocks.reduce((acc, block) => {
      const postId = block.data.document.id
      if (firstThreePostIds.includes(postId)) {
        acc[postId] = (acc[postId] || 0) + 1
      }
      return acc
    }, {} as { [key: string]: number })

    // Find the post id with the maximum count among the first 3 posts
    // Ensure it's been referred to at least once
    let maxCount = 0
    let topPostId: string | null = null

    for (const postId of firstThreePostIds) {
      if (postCounts[postId] > maxCount) {
        maxCount = postCounts[postId]
        topPostId = postId
      }
    }

    // Ensure the post has been referred to at least once
    return maxCount > 0 && topPostId
      ? posts.findIndex((p) => p.data.id === (topPostId as string))
      : -1
  }, [blocks, posts])

  const topPost = useMemo(() => {
    return mostReferredPostIndex >= 0 ? posts[mostReferredPostIndex] : null
  }, [mostReferredPostIndex])

  const [
    renderPosts,
    renderBlocks,
    imageBlocksInTopResult,
    textBlocksInTopResult,
  ] = useMemo(() => {
    const _renderPosts = topPost
      ? posts.filter((p) => p.data.id !== topPost.data.id)
      : posts

    const blocksRelatedToTopPost = blocks.filter(
      (b) => b.data.document.id === topPost?.data.id,
    )

    const imageBlocksInTopResult = blocksRelatedToTopPost
      .filter((block) => block.type === LPE.ContentTypes.Image)
      .slice(0, uiConfigs.searchResult.numberOfImagesShowInTopResult)
      .map((b) => b.data)

    const textBlocksInTopResult = blocksRelatedToTopPost
      .filter((block) => block.type === LPE.ContentTypes.Text)
      .slice(0, uiConfigs.searchResult.numberOfParagraphsShowInTopResult)
      .map((b) => b.data)

    const _renderBlocks = blocks.filter((b) => {
      if (b.type === LPE.ContentTypes.Image) {
        return (
          imageBlocksInTopResult.findIndex((ib) => ib.id === b.data.id) === -1
        )
      }
      return true
    })

    return [
      _renderPosts,
      _renderBlocks,
      imageBlocksInTopResult,
      textBlocksInTopResult,
    ]
  }, [posts, blocks, topPost])

  const sectionTitle = useMemo(() => {
    const hasArticle = selectedTypes.includes(LPE.ContentTypes.Article)
    const hasPodcast = selectedTypes.includes(LPE.ContentTypes.Podcast)

    // Count both the topPost (if any) and the posts rendered in the list
    const totalPostCount = renderPosts.length + (topPost ? 1 : 0)

    if (hasArticle && hasPodcast) {
      return copyConfigs.search.labels.articlesAndPodcasts
    } else if (hasArticle) {
      return totalPostCount === 1 ? 'Article' : 'Articles'
    } else if (hasPodcast) {
      return totalPostCount === 1 ? 'Podcast' : 'Podcasts'
    }

    return copyConfigs.search.labels.articlesAndPodcasts
  }, [selectedTypes, renderPosts, topPost])

  return (
    <Container xs={{ cols: 8 }} md={{ cols: 12 }} lg={{ cols: 16 }} cols={16}>
      <PostsList xs={{ cols: 8 }} md={{ cols: 8 }} lg={{ cols: 11 }}>
        {topPost && (
          <CustomSection title={copyConfigs.search.labels.topResults}>
            <SearchResultTopPost
              post={topPost}
              shows={shows}
              relatedImageBlocks={
                imageBlocksInTopResult as LPE.Article.ImageBlock[]
              }
              relatedTextBlocks={
                textBlocksInTopResult as LPE.Article.TextBlock[]
              }
            />
          </CustomSection>
        )}
        <PostsListContent>
          {renderPosts.length > 0 ? (
            <>
              <CustomSection title={sectionTitle}>
                <SearchResultListPosts posts={renderPosts} shows={shows} />
              </CustomSection>
              {hasMore && onLoadMore && (
                <LoadMoreButtonContainer>
                  <LoadMoreButton onClick={onLoadMore} disabled={busy}>
                    <Typography variant={'body1'} genericFontFamily={'serif'}>
                      {busy ? 'Loading...' : 'Load more'}
                    </Typography>
                  </LoadMoreButton>
                </LoadMoreButtonContainer>
              )}
            </>
          ) : (
            !busy &&
            !topPost && (
              <Typography variant={'subtitle2'} genericFontFamily={'serif'}>
                No results found
              </Typography>
            )
          )}
        </PostsListContent>
      </PostsList>
      <GridItem xs={{ cols: 0 }} md={{ cols: 1 }} cols={1} />
      {/* <BlocksList xs={{ cols: 8 }} md={{ cols: 3 }} lg={{ cols: 4 }} cols={4}>
        {!isMobile && (
          <BlockListSticky>
            <SearchResultsListHeader
              title={copyConfigs.search.labels.relatedContent}
            />
            <SearchResultListBlocks blocks={renderBlocks} />
          </BlockListSticky>
        )}
      </BlocksList> */}
    </Container>
  )
}

const Container = styled(Grid)`
  padding-top: 56px;

  ${({ theme }) => lsdUtils.breakpoint(theme, 'xs', 'exact')} {
    padding-top: 32px;
  }
`

const PostsList = styled(GridItem)`
  display: flex !important;
  flex-direction: column;
  gap: 80px;

  ${({ theme }) => lsdUtils.breakpoint(theme, 'xs', 'exact')} {
    gap: 64px;
  }
`
const PostsListContent = styled.div``

const CustomSection = styled(Section)`
  &.section.section--small.section--bordered {
    border-top: none;
  }
`

const LoadMoreButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 48px;
  padding-top: 32px;
`

const LoadMoreButton = styled(Button)`
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`
