import { Grid, GridItem } from '@/components/Grid/Grid'
import { SearchResultListBlocks } from '@/components/Search/SearchResult.Blocks'
import { SearchResultTopPost } from '@/components/Search/SearchResult.TopPost'
import { SearchResultListPosts } from '@/components/Search/SearchResultList.Posts'
import { SearchResultsListHeader } from '@/components/Search/SearchResultsList.Header'
import { copyConfigs } from '@/configs/copy.configs'
import { uiConfigs } from '@/configs/ui.configs'
import { LPE } from '@/types/lpe.types'
import { lsdUtils } from '@/utils/lsd.utils'
import useWindowSize from '@/utils/ui.utils'
import { Typography } from '@acid-info/lsd-react'
import styled from '@emotion/styled'
import { useMemo } from 'react'

interface Props {
  posts: LPE.Search.ResultItemBase<LPE.Post.Document>[]
  blocks: LPE.Search.ResultItemBase<LPE.Post.ContentBlock>[]
  shows: LPE.Podcast.Show[]
  busy: boolean
  showTopPost: boolean
}

export const SearchResultsListView = (props: Props) => {
  const { posts, shows, blocks, busy, showTopPost } = props
  const isMobile = useWindowSize().width < 768

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

  return (
    <Container xs={{ cols: 8 }} md={{ cols: 12 }} lg={{ cols: 16 }} cols={16}>
      <PostsList xs={{ cols: 8 }} md={{ cols: 8 }} lg={{ cols: 11 }}>
        {topPost && (
          <PostsListHeader>
            <SearchResultsListHeader
              title={copyConfigs.search.labels.topResults}
            />
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
          </PostsListHeader>
        )}
        <PostsListContent>
          {renderPosts.length > 0 ? (
            <>
              <SearchResultsListHeader
                title={copyConfigs.search.labels.articlesAndPodcasts}
              />
              <SearchResultListPosts posts={renderPosts} shows={shows} />
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
      <BlocksList xs={{ cols: 8 }} md={{ cols: 3 }} lg={{ cols: 4 }} cols={4}>
        {!isMobile && (
          <BlockListSticky>
            <SearchResultsListHeader
              title={copyConfigs.search.labels.relatedContent}
            />
            <SearchResultListBlocks blocks={renderBlocks} />
          </BlockListSticky>
        )}
      </BlocksList>
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
  display: flex;
  flex-direction: column;
  gap: 56px;

  ${({ theme }) => lsdUtils.breakpoint(theme, 'xs', 'exact')} {
    gap: 32px;
  }
`
const PostsListHeader = styled.div``
const PostsListContent = styled.div``

const BlocksList = styled(GridItem)``

const BlockListSticky = styled.div`
  position: sticky;
  top: ${uiConfigs.navbarRenderedHeight * 2 + 12}px;
  height: 100vh;
  overflow-y: auto;
`
