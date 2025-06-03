/** @jsxImportSource @emotion/react */
import { Typography } from '@acid-info/lsd-react'
import styled from '@emotion/styled'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { LPE } from '../../types/lpe.types'
import { getPostLink } from '../../utils/route.utils'
import { ChevronRightIcon } from '../Icons/ChevronRightIcon'

export type PodcastShowInfoProps = {
  show: LPE.Podcast.Show
}

export const PodcastShowInfo: React.FC<PodcastShowInfoProps> = ({ show }) => {
  return (
    <Container className="podcasts__show-info">
      <div className="podcasts__show-header">
        <Image
          width={32}
          height={32}
          alt={show.title}
          src={show.logo.url}
          className="podcasts__show-logo"
        />
        <Link
          href={getPostLink('podcast', { showSlug: show.slug })}
          className="podcasts__show-link"
        >
          <Typography
            component="h3"
            variant="subtitle2"
            className="podcasts__show-title"
          >
            {show.title}
          </Typography>
          <ChevronRightIcon color="primary" />
        </Link>
      </div>
      {show.description && (
        <Typography
          variant="subtitle3"
          className="podcasts__show-description"
          dangerouslySetInnerHTML={{ __html: show.description }}
        />
      )}
      <Typography variant="subtitle3" className="podcasts__show-hosts">
        {show.hosts.length > 0 && (
          <span>
            Hosted by:{' '}
            {show.hosts.map((host, index) => (
              <span key={index}>{host.name}</span>
            ))}
          </span>
        )}
      </Typography>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--lsd-spacing-24);
  border-top: 1px solid rgb(var(--lsd-border-primary));
  padding: var(--lsd-spacing-24) 0;
  flex: 1;

  .footnotes-container {
    display: none;
  }

  .podcasts__show-header {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0 8px;
  }

  .podcasts__show-logo {
    width: 32px;
    height: 32px;
    border-radius: 100%;
  }

  .podcasts__show-title {
    margin-left: 8px;
  }

  .podcasts__show-link {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: var(--lsd-spacing-8);
    text-decoration: none;
  }

  .podcasts__show-description {
    display: block;
  }

  .podcasts__show-hosts {
    display: block;

    span:not(:last-child) {
      &:after {
        content: '•';
        margin: 0 8px;
        text-decoration: none;
        display: inline-block;
      }
    }
  }
`
