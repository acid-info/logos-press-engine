import styled from '@emotion/styled'
import { useCallback, useEffect, useState } from 'react'
import { discourseApi } from '../../services/discourse.service'
import { LPE } from '../../types/lpe.types'
import { lsdUtils } from '../../utils/lsd.utils'
import { ArrowUpRightIcon } from '../Icons/ArrowUpRightIcon'
import { DotIcon } from '../Icons/DotIcon'

interface ArticleCommentsProps {
  article: LPE.Article.Data
}

interface CommentsState {
  topic: LPE.Discourse.TopicResponse | null
  loading: boolean
  error: string | null
}

const ERROR_MESSAGES = {
  LOAD_FAILED: 'Failed to load comments',
  CREATE_FAILED: 'Failed to create discussion topic',
} as const

const COMMENTS_CONFIG = {
  // Skip the original post
  PREVIEW_POST_START_INDEX: 1,
  PREVIEW_POST_END_INDEX: 4,
  MIN_POSTS_FOR_VIEW_MORE: 4,
  // px
  AVATAR_SIZE: '40',
  // Offset to exclude original post from count
  ORIGINAL_POST_OFFSET: 1,
} as const

const ArticleComments = ({ article }: ArticleCommentsProps) => {
  const [state, setState] = useState<CommentsState>({
    topic: null,
    loading: false,
    error: null,
  })

  const updateState = (updates: Partial<CommentsState>) =>
    setState((prev) => ({ ...prev, ...updates }))

  const callGetTopic = useCallback(async (topicId: number) => {
    const response = await fetch(`/api/discourse/getTopic?topicId=${topicId}`, {
      method: 'GET',
    })
    return { response, data: await response.json() }
  }, [])

  const callCreateTopic = useCallback(async (articleData: LPE.Article.Data) => {
    const response = await fetch('/api/discourse/createTopic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ articleData }),
    })
    return { response, data: await response.json() }
  }, [])

  const processPostContent = (content: string) =>
    content.replace(/href="\/u\//g, `href="${discourseApi.forumBaseUrl}/u/`)

  const openTopic = (slug: string, id: number) =>
    window.open(discourseApi.getTopicUrl(slug, id), '_blank')

  const fetchTopic = useCallback(
    async (topicId: number) => {
      updateState({ loading: true, error: null })
      try {
        const { response, data } = await callGetTopic(topicId)
        updateState({
          topic: response.ok ? data.data : null,
          loading: false,
          error: response.ok ? null : ERROR_MESSAGES.LOAD_FAILED,
        })
      } catch {
        updateState({ loading: false, error: ERROR_MESSAGES.LOAD_FAILED })
      }
    },
    [callGetTopic],
  )

  const handleStartDiscussion = async () => {
    updateState({ loading: true, error: null })
    try {
      const { response, data } = await callCreateTopic(article)
      if (response.ok) {
        openTopic(data.data.topic_slug, data.data.topic_id)
        await fetchTopic(data.data.topic_id)
      } else {
        updateState({ loading: false, error: ERROR_MESSAGES.CREATE_FAILED })
      }
    } catch {
      updateState({ loading: false, error: ERROR_MESSAGES.CREATE_FAILED })
    }
  }

  const handleJoinDiscussion = () => {
    if (state.topic) openTopic(state.topic.slug, state.topic.id)
  }

  useEffect(() => {
    if (article.discourse_topic_id) fetchTopic(article.discourse_topic_id)
  }, [article.discourse_topic_id, fetchTopic])

  const hasDiscussion = !!(article.discourse_topic_id || state.topic)
  const { topic, loading, error } = state

  const commentCount = topic
    ? topic.posts_count - COMMENTS_CONFIG.ORIGINAL_POST_OFFSET
    : 0

  return (
    <Container>
      <Header>
        <Title>Discussion</Title>
        <ActionButton
          onClick={hasDiscussion ? handleJoinDiscussion : handleStartDiscussion}
          disabled={loading}
        >
          {loading
            ? 'Loading...'
            : hasDiscussion
            ? 'Join Discussion'
            : 'Start Discussion'}
        </ActionButton>
      </Header>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {topic ? (
        <Content>
          <TopicInfo>
            <TopicTitle>{topic.title}</TopicTitle>
            <Meta>
              {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
              <DotIcon color="primary" />
              <ViewDiscussion onClick={handleJoinDiscussion}>
                View full discussion
                <ArrowUpRightIcon />
              </ViewDiscussion>
            </Meta>
          </TopicInfo>

          <Posts>
            {topic.post_stream.posts
              .slice(
                COMMENTS_CONFIG.PREVIEW_POST_START_INDEX,
                COMMENTS_CONFIG.PREVIEW_POST_END_INDEX,
              )
              .map((post) => (
                <Post key={post.id}>
                  <Author>
                    <Avatar
                      src={`${
                        discourseApi.forumBaseUrl
                      }${post.avatar_template.replace(
                        '{size}',
                        COMMENTS_CONFIG.AVATAR_SIZE,
                      )}`}
                      alt={post.username}
                    />
                    <AuthorInfo>
                      <AuthorName>
                        {post.display_username || post.username}
                      </AuthorName>
                      <PostDate>
                        {new Date(post.created_at).toLocaleDateString()}
                      </PostDate>
                    </AuthorInfo>
                  </Author>
                  <PostContent
                    dangerouslySetInnerHTML={{
                      __html: processPostContent(post.cooked),
                    }}
                  />
                </Post>
              ))}
          </Posts>

          {topic.posts_count > COMMENTS_CONFIG.MIN_POSTS_FOR_VIEW_MORE && (
            <ViewMore onClick={handleJoinDiscussion}>
              View all {commentCount} comments on Logos Forum
              <ArrowUpRightIcon />
            </ViewMore>
          )}
        </Content>
      ) : (
        !loading && !error && <NoComments>No discussion yet.</NoComments>
      )}
    </Container>
  )
}

const Container = styled.div`
  margin-bottom: 32px;
  ${(props) => lsdUtils.breakpoint(props.theme, 'xs', 'down')} {
    margin-bottom: 24px;
  }
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`

const Title = styled.h3`
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--lsd-text-primary);
`

const ActionButton = styled.button`
  background: var(--lsd-surface-primary);
  color: var(--lsd-text-primary);
  font-size: 14px;
  cursor: pointer;
  border: none;
  text-decoration: underline;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    text-decoration: none;
  }
`

const ErrorMessage = styled.div`
  color: var(--lsd-text-primary);
  padding: 12px;
  background: var(--lsd-surface-secondary);
  margin-bottom: 16px;
  font-size: 14px;
`

const NoComments = styled.div`
  color: var(--lsd-text-secondary);
  padding: 16px;
  text-align: center;
  font-size: 14px;
  font-style: italic;
`

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const TopicInfo = styled.div``

const TopicTitle = styled.h4`
  font-size: 16px;
  font-weight: 500;
  color: var(--lsd-text-primary);
`

const Meta = styled.div`
  font-size: 12px;
  color: var(--lsd-text-secondary);
  display: flex;
  align-items: center;
  gap: 8px;
  ${(props) => lsdUtils.breakpoint(props.theme, 'xs', 'down')} {
    flex-wrap: wrap;
  }
`

const ViewDiscussion = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: var(--lsd-text-secondary);
  cursor: pointer;
  font-size: inherit;
  padding: 0;
  &:hover {
    text-decoration: underline;
  }
`

const Posts = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const Post = styled.div``

const Author = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`

const Avatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
`

const AuthorInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`

const AuthorName = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: var(--lsd-text-primary);
`

const PostDate = styled.span`
  font-size: 12px;
  color: var(--lsd-text-secondary);
`

const PostContent = styled.div`
  font-size: 14px;
  line-height: 1.5;
  color: var(--lsd-text-primary);

  p {
    margin: 0 0 8px 0;
    &:last-child {
      margin-bottom: 0;
    }
  }

  blockquote {
    margin: 8px 0;
    padding-left: 16px;
    border-left: 3px solid var(--lsd-border-secondary);
    color: var(--lsd-text-secondary);
  }

  code {
    background: var(--lsd-surface-secondary);
    font-size: 12px;
  }

  pre {
    background: var(--lsd-surface-secondary);
    overflow-x: auto;
  }

  a {
    color: var(--lsd-text-secondary);
    text-decoration: underline;
  }

  aside.quote {
    font-style: italic;
    padding-left: 16px;

    .title {
      display: flex;
      align-items: center;
      gap: 4px;
      padding-left: 16px;

      img {
        border: none;
        border-radius: 50%;
      }
    }
  }
`

const ViewMore = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  color: var(--lsd-text-primary);
  border: none;
  padding: 0;
  cursor: pointer;
  font-size: 14px;
  align-self: center;
  margin-top: 10px;
  text-decoration: underline;
`

export default ArticleComments
