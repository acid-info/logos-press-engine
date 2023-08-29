import styled from '@emotion/styled'
import ReactPlayer from 'react-player'
import { useHookstate } from '@hookstate/core'
import { playerState } from '@/components/GlobalAudioPlayer/globalAudioPlayer.state'
import { useEffect, useRef, useState } from 'react'
import { episodeState } from '@/components/GlobalAudioPlayer/episode.state'
import SimplecastPlayer from './Episode.SimplecastPlayer'
import { LPE } from '@/types/lpe.types'
import { useRouter } from 'next/router'

export type EpisodePlayerProps = {
  channel: LPE.Podcast.Channel
  coverImage: LPE.Podcast.Document['coverImage']
  title: string
  showTitle: string
}

const EpisodePlayer = ({
  channel,
  coverImage,
  title,
  showTitle,
}: EpisodePlayerProps) => {
  const router = useRouter()

  const state = useHookstate(playerState)
  const epState = useHookstate(episodeState)

  const playerContainerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<ReactPlayer>(null)

  const [volume, setVolume] = useState(state.value.volume)

  const isSimplecast = channel?.name === LPE.Podcast.ChannelNames.Simplecast

  const url =
    channel?.name === LPE.Podcast.ChannelNames.Youtube
      ? channel.url
      : (
          channel as Extract<
            LPE.Podcast.Channel,
            { name: typeof LPE.Podcast.ChannelNames.Simplecast }
          >
        ).data.audioFileUrl

  const keepPlaying =
    state.value.url !== url && state.value.isEnabled && state.value.playing

  const [keepGlobalPlay, setKeepGlobalPlay] = useState(keepPlaying)

  useEffect(() => {
    if (keepPlaying) {
      setKeepGlobalPlay(true)
      playerRef.current?.seekTo(0)
    }
  }, [keepPlaying])

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        if (keepPlaying) {
          state.set((prev) => ({
            ...prev,
            isEnabled: true,
          }))
        } else {
          state.set((prev) => ({
            ...prev,
            isEnabled: false,
          }))
        }
      } else {
        state.set((prev) => ({
          ...prev,
          isEnabled: true,
          volume: volume,
        }))
      }
    })
    observer.observe(playerContainerRef.current as any)

    return () => {
      observer.disconnect()
    }
  }, [keepGlobalPlay, volume])

  useEffect(() => {
    const handleLeave = () => {
      if (state.value.playing) {
        state.set((prev) => ({
          ...prev,
          isEnabled: true,
        }))
      }
    }
    router.events.on('routeChangeStart', handleLeave)

    return () => {
      router.events.off('routeChangeStart', handleLeave)
    }
  }, [])

  useEffect(() => {
    epState.set({
      title: title,
      podcast: showTitle,
      url: url as string,
      coverImage: coverImage ?? null,
    })
  }, [title, showTitle, coverImage])

  useEffect(() => {
    if (!state.value.isEnabled) {
      const offset = state.value.played === 0 ? 0 : 1 / state.value.duration // 1 second in %
      playerRef.current?.seekTo(state.value.played + offset)
    }
  }, [state.value.isEnabled])

  useEffect(() => {
    const listener = (event: any) => {
      if (event.origin == 'https://www.youtube.com') {
        const data = JSON.parse(event?.data)

        if (data?.info?.hasOwnProperty('muted') && !state.value.isEnabled) {
          const isMuted = data.info.muted === true
          const muteChanged = state.value.muted !== isMuted

          const newVolume = data.info?.volume / 100 || state.value.volume

          if (isMuted) {
            if (muteChanged && !state.value.muted) {
              // TODO : handle mute
            }
          } else if (!isMuted) {
            if (muteChanged) {
              state.set((prev) => ({
                ...prev,
                muted: false,
                volume: newVolume,
              }))
            }
            setVolume(newVolume)
          }
        }
      }
    }

    if (channel?.name === LPE.Podcast.ChannelNames.Youtube) {
      window.addEventListener('message', listener)
    }

    return () => {
      window.removeEventListener('message', listener)
    }
  }, [])

  const handleProgress = (newState: {
    playedSeconds: number
    played: number
    loaded: number
  }) => {
    if (!state.value.isEnabled) {
      state.set((prev) => ({
        ...prev,
        playedSeconds: newState.playedSeconds,
        played: newState.played,
        loaded: newState.loaded,
      }))
    }
  }

  const handlePlay = () => {
    if (keepGlobalPlay) {
      setKeepGlobalPlay(false)
      state.set((prev) => ({
        ...prev,
        isEnabled: false,
        played: 0,
        url: url,
        playing: true,
      }))
    } else {
      state.set((prev) => ({ ...prev, url: url, playing: true }))
    }
  }

  const handlePause = () => state.set((prev) => ({ ...prev, playing: false }))

  const handleDuration = (duration: number) =>
    state.set((prev) => ({ ...prev, duration }))

  return (
    <>
      {isSimplecast && (
        <SimplecastPlayer
          playing={keepGlobalPlay ? false : state.value.playing}
          playedSeconds={keepGlobalPlay ? 0 : state.value.playedSeconds}
          played={keepGlobalPlay ? 0 : state.value.played}
          playerRef={playerRef}
          coverImage={
            epState.value.coverImage as LPE.Podcast.Document['coverImage']
          }
          handlePlay={handlePlay}
          handlePause={handlePause}
        />
      )}
      <PlayerContainer ref={playerContainerRef} isAudio={isSimplecast}>
        <ReactPlayer
          forceAudio={isSimplecast ? true : false}
          ref={playerRef}
          url={url as string}
          playing={keepGlobalPlay ? false : state.value.playing}
          controls={isSimplecast ? false : true}
          volume={state.value.volume}
          muted={
            state.value.isEnabled ? true : state.value.muted ? true : false
          }
          onProgress={handleProgress}
          onPlay={handlePlay}
          onPause={handlePause}
          onDuration={handleDuration}
          config={{
            youtube: {
              playerVars: { enablejsapi: 1 },
            },
          }}
        />
      </PlayerContainer>
    </>
  )
}

const PlayerContainer = styled.div<{ isAudio: boolean }>`
  margin-bottom: ${(props) => (props.isAudio ? '0' : '32px')};
  position: relative;
  padding-bottom: ${(props) => (props.isAudio ? '0' : '56.25%')};
  padding-top: 32px;
  height: 0;
  overflow: hidden;

  iframe,
  object,
  embed {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  @media (max-width: 768px) {
    padding-top: 24px;
  }
`

export default EpisodePlayer
