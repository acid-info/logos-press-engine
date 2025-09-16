import {
  extractClassFromFirstTag,
  extractIdFromFirstTag,
} from '@/utils/html.utils'
import { lsdUtils } from '@/utils/lsd.utils'
import { parseTranscriptionText } from '@/utils/string.utils'
import { Typography } from '@acid-info/lsd-react'
import styled from '@emotion/styled'
import ReactPlayer from 'react-player'
import { LPE } from '../../types/lpe.types'

export const RenderEpisodeBlock = ({
  block,
}: {
  block: Extract<LPE.Post.ContentBlock, LPE.Post.TextBlock>
  hide?: boolean
}) => {
  const isYoutubeRegex =
    /^(https?\:\/\/)?((www\.)?youtube\.com|youtu\.?be)\/.+$/

  const isYoutube = isYoutubeRegex.test(block.html)
  const youtubeLink = block.html.match(isYoutubeRegex) ?? []

  if (isYoutube) return <ReactPlayer url={youtubeLink[0]} />
  else {
    const { time, speaker, transcript } = parseTranscriptionText(block.text)

    return transcript?.length ? (
      <TranscriptionItem variant="body1" component={'div'}>
        {time && (
          <>
            <TranscriptInfo variant="body2">[{time}]</TranscriptInfo>
          </>
        )}
        <Transcript>
          <TranscriptInfo variant="body2" component="p">
            {speaker}
          </TranscriptInfo>
          <TranscriptText
            className={extractClassFromFirstTag(block.html) || ''}
            id={extractIdFromFirstTag(block.html) || `p-${block.id}`}
            variant="body1"
            component="p"
          >
            {transcript}
          </TranscriptText>
        </Transcript>
      </TranscriptionItem>
    ) : block?.html ? (
      <div dangerouslySetInnerHTML={{ __html: block.html }} />
    ) : null
  }
}

const TranscriptionItem = styled(Typography)`
  display: flex;
  flex-direction: row;
  gap: 12px;
`

const TranscriptInfo = styled(Typography)`
  ${(props) => lsdUtils.breakpoint(props.theme, 'xs', 'down')} {
    font-size: var(--lsd-body3-fontSize);
    line-height: var(--lsd-body3-lineHeight);
  }
`

const Transcript = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const TranscriptText = styled(Typography)`
  ${(props) => lsdUtils.breakpoint(props.theme, 'xs', 'down')} {
    font-size: var(--lsd-body2-fontSize);
    line-height: var(--lsd-body2-lineHeight);
  }
`
