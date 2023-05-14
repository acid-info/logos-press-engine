import { UnbodyGraphQl } from '@/lib/unbody/unbody-content.types'
import Author from './Author'
import styled from '@emotion/styled'

export enum AuthorsDirection {
  COLUMN = 'column',
  ROW = 'row',
}

const Authors = ({
  mentions,
  email,
  gap = 16,
  flexDirection = AuthorsDirection.COLUMN,
}: {
  mentions: UnbodyGraphQl.Fragments.MentionItem[]
  email: boolean
  gap?: number
  flexDirection?: AuthorsDirection
}) => {
  return mentions?.length > 0 ? (
    <AuthorsContainer gap={gap} flexDirection={flexDirection}>
      {mentions.map((mention) => (
        <Author key={mention.name} mention={mention} email={email} />
      ))}
    </AuthorsContainer>
  ) : null
}

const AuthorsContainer = styled.div<{
  gap: number
  flexDirection: AuthorsDirection
}>`
  display: flex;
  flex-direction: ${({ flexDirection }) => flexDirection};
  gap: ${({ gap }) => gap}px;
`

export default Authors
