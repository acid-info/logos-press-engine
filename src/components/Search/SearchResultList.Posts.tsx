import { PostCard } from '@/components/PostCard'
import { LPE } from '@/types/lpe.types'
import { lsdUtils } from '@/utils/lsd.utils'
import { useIsMobile } from '@/utils/ui.utils'
import styled from '@emotion/styled'

interface Props {
  posts: LPE.Search.ResultItemBase<LPE.Post.Document>[]
  shows: LPE.Podcast.Show[]
}
export const SearchResultListPosts = ({ posts, shows }: Props) => {
  const isMobile = useIsMobile()

  return (
    <Container>
      {posts.map((post, index) => {
        const data = PostCard.toData(post.data, shows)
        return (
          <StyledPostCard
            data={{
              ...data,
              authors: [],
            }}
            className={'post-card__search-result'}
            size={'large'}
            contentType={post.type as LPE.PostType}
            key={`result-${index}`}
            isSubtitleFullWidth={isMobile}
          />
        )
      })}
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 40px;

  .post-card__subtitle {
    display: block;
    margin-top: 16px;
  }

  ${(props) => lsdUtils.breakpoint(props.theme, 'sm', 'up')} {
    gap: 8px;
  }
`

const StyledPostCard = styled(PostCard)`
  .post-card__content {
    flex: 2 !important;
  }
`
