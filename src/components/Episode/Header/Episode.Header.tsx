import ArticleSummary from '@/components/Article/Header/Article.Summary'
import { TagsAndSocial } from '@/components/TagsAndSocial'
import { Typography } from '@acid-info/lsd-react'
import styled from '@emotion/styled'
import Image from 'next/image'
import Link from 'next/link'
import { LPE } from '../../../types/lpe.types'
import { lsdUtils } from '../../../utils/lsd.utils'
import { getPodcastEmbed } from '../../../utils/podcastEmbed.utils'
import { getPostLink } from '../../../utils/route.utils'
import EpisodeStats from '../Episode.Stats'
import EpisodeChannels from './Episode.Channels'
import EpisodeEmbedPlayer from './Episode.EmbedPlayer'
import EpisodePlayer from './Episode.Player'

export type EpisodeHeaderProps = LPE.Podcast.Document & {
  channel?: LPE.Podcast.Channel
  duration?: number
}

const EpisodeHeader = ({
  channel,
  summary,
  title,
  description,
  publishedAt,
  tags,
  show,
  channels,
  duration,
  coverImage,
}: EpisodeHeaderProps) => {
  const date = new Date(publishedAt)
  const embed = getPodcastEmbed(channel)

  return (
    <EpisodeHeaderContainer>
      {embed ? (
        <EpisodeEmbedPlayer embed={embed} />
      ) : (
        channel && (
          <EpisodePlayer
            title={title}
            showTitle={show?.title ?? ''}
            channel={channel}
            coverImage={coverImage}
          />
        )
      )}
      <EpisodeStats date={date} duration={duration ?? 0} />
      <EpisodeTitle variant="h2" genericFontFamily="serif" component="h1">
        {title}
      </EpisodeTitle>
      {show && (
        <CustomLink href={getPostLink('podcast', { showSlug: show.slug })}>
          <Show>
            <Image
              src={show.logo.url}
              alt={show.logo.alt}
              width={24}
              height={24}
            />
            <Typography variant="body2">{show?.title}</Typography>
          </Show>
        </CustomLink>
      )}
      <TagsAndSocial tags={tags.map((tag) => tag.name)} />
      {channels && <EpisodeChannels channels={channels} />}
      {description && (
        <ArticleSummary summary={summary ?? description} showLabel={false} />
      )}
    </EpisodeHeaderContainer>
  )
}

const EpisodeHeaderContainer = styled.header`
  display: flex;
  flex-direction: column;
`

const CustomTypography = styled(Typography)`
  text-overflow: ellipsis;
  word-break: break-word;
  white-space: pre-wrap;
`

const EpisodeTitle = styled(Typography)`
  margin-bottom: 16px;

  ${(props) => lsdUtils.breakpoint(props.theme, 'sm', 'down')} {
    margin-bottom: 8px;
    ${lsdUtils.typography('h4')}
  }
`

const EpisodeSubtitle = styled(CustomTypography)`
  margin-top: 32px;

  @media (max-width: 768px) {
    font-size: var(--lsd-subtitle1-fontSize) !important;
    line-height: var(--lsd-subtitle1-lineHeight) !important;
    margin-top: 24px;
  }
`

const Show = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  text-decoration: none;
`

const CustomLink = styled(Link)`
  text-decoration: none;
  width: fit-content;
`

export default EpisodeHeader
