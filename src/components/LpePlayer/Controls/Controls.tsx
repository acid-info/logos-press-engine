import styled from '@emotion/styled'
import { PauseIcon } from '@/components/Icons/PauseIcon'
import { PlayIcon } from '@/components/Icons/PlayIcon'
import { convertSecToMinAndSec } from '@/utils/string.utils'
import { Typography } from '@acid-info/lsd-react'
import { MuteIcon } from '@/components/Icons/MuteIcon'
import { VolumeIcon } from '@/components/Icons/VolumeIcon'
import styles from '@/components/GlobalAudioPlayer/GlobalAudioPlayer.module.css'
import React from 'react'
import {
  ControlsTimeTrackProps,
  TimeTrack,
} from '@/components/LpePlayer/Controls/Controls.TimeTrack'

export interface LpeAudioPlayerControlsProps {
  duration: number
  playedSeconds: number
  playing: boolean
  muted: boolean
  played: number
  onPause: () => void
  onPlay: () => void
  onVolumeToggle: () => void

  color?: string

  timeTrackProps: ControlsTimeTrackProps
}

export const LpeAudioPlayerControls = (props: LpeAudioPlayerControlsProps) => {
  const {
    duration,
    playedSeconds,
    playing,
    muted,
    played,
    onPause,
    onPlay,
    color = 'rgba(var(--lsd-surface-secondary), 1)',
    onVolumeToggle,
    timeTrackProps: { onValueChange, onMouseDown, onMouseUp },
  } = props

  return (
    <Container>
      <Buttons>
        <Row>
          <PlayPause onClick={playing ? onPause : onPlay}>
            {playing ? <PauseIcon fill={color} /> : <PlayIcon fill={color} />}
          </PlayPause>
          <TimeContainer>
            <Time variant="body3">{convertSecToMinAndSec(playedSeconds)}</Time>
            <Typography variant="body3">/</Typography>
            <Time variant="body3">{convertSecToMinAndSec(duration)}</Time>
          </TimeContainer>
        </Row>
        <VolumeContainer onClick={onVolumeToggle}>
          {muted ? <MuteIcon fill={color} /> : <VolumeIcon fill={color} />}
        </VolumeContainer>
      </Buttons>
      <Seek className={styles.audioPlayer}>
        <TimeTrack
          min={0}
          max={1}
          value={played}
          progressColor={color}
          trackColor={color}
          {...props.timeTrackProps}
        />
      </Seek>
    </Container>
  )
}
const Container = styled.div``

const Buttons = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`

const VolumeContainer = styled.div`
  display: flex;
  justify-content: center;
  position: relative;
  align-items: center;
  cursor: pointer;
`

const Seek = styled.div`
  display: flex;
  width: 100%;
`

const PlayPause = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  margin-right: 8px;
`

const Row = styled.div`
  display: flex;
  align-items: center;
  white-space: pre-wrap;
`

const TimeContainer = styled(Row)`
  gap: 8px;
`

const Time = styled(Typography)`
  width: 32px;
`