import { CommonProps } from '@acid-info/lsd-react/dist/utils/useCommonProps'
import styled from '@emotion/styled'
import { Post, PostProps } from '../Post'
import { Typography } from '@acid-info/lsd-react'
import Link from 'next/link'

export type PostContainerProps = CommonProps &
  React.HTMLAttributes<HTMLDivElement> & {
    title?: string
    postsData: PostProps[]
  }

export default function PostContainer({
  title,
  postsData,
  ...props
}: PostContainerProps) {
  return (
    <div {...props}>
      {title && (
        <Title variant="body1" genericFontFamily="sans-serif">
          {title}
        </Title>
      )}
      <Container>
        {postsData.map((post, index) => (
          <PostLink key={index} href={`/article/${post.data.remoteId}`}>
            <PostWrapper>
              <Post {...post} />
            </PostWrapper>
          </PostLink>
        ))}
      </Container>
    </div>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: row;
  padding: 16px;
  gap: 24px;

  // temporary breakpoint
  @media (max-width: 768px) {
    flex-direction: column;
  }
`

const PostWrapper = styled.div`
  padding: 16px 0;
  border-top: 1px solid rgb(var(--lsd-theme-primary));
  width: 100%;
`

const Title = styled(Typography)`
  padding: 0 16px;
`

const PostLink = styled(Link)`
  text-decoration: none;
`
