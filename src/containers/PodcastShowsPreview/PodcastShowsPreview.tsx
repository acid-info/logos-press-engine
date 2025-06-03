import { Typography } from '@acid-info/lsd-react'
import { css } from '@emotion/react'
import styled from '@emotion/styled'
import clsx from 'clsx'
import React from 'react'
import { PodcastShowInfo } from '../../components/PodcastShowInfo'
import { PostsGrid } from '../../components/PostsGrid'
import { LPE } from '../../types/lpe.types'
import { lsdUtils } from '../../utils/lsd.utils'

export type PodcastShowsPreviewProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
> & {
  data: {
    shows: LPE.Podcast.Show[]
  }
}

export const PodcastShowsPreview: React.FC<PodcastShowsPreviewProps> = ({
  data,
  data: { shows = [] },
  ...props
}) => {
  return (
    <Root {...props} className={clsx('podcasts', props.className)}>
      <div className="podcasts__header">
        <Typography component="h2" variant="h2">
          Podcasts
        </Typography>
      </div>
      <div className="podcasts__all-shows-info">
        {shows.slice(0, 2).map((show) => (
          <PodcastShowInfo key={show.id} show={show} />
        ))}
      </div>
      <div className={clsx('podcasts__shows')}>
        {shows.slice(0, 2).map((show) => (
          <div key={show.id} className={clsx('podcasts__show')}>
            <div className="podcasts__show-episodes">
              <PostsGrid
                posts={(show.episodes || []).slice(0, 1)}
                shows={shows}
                displayPodcastShow
                pattern={[
                  {
                    cols: 1,
                    size: 'medium',
                  },
                ]}
                style={{ marginBottom: 16 }}
              />
              <PostsGrid
                posts={(show.episodes || [])
                  .slice(1, 3)
                  .map((ep) => ({ ...ep, show }))}
                displayPodcastShow
                pattern={[
                  {
                    cols: 1,
                    size: 'small',
                  },
                ]}
                breakpoints={[
                  {
                    breakpoint: 'xs',
                    pattern: [{ cols: 1, size: 'small', rowBorder: true }],
                  },
                  {
                    breakpoint: 'md',
                    pattern: [
                      { cols: 1, size: 'small' },
                      { cols: 1, size: 'small', rowBorder: true },
                    ],
                  },
                ]}
              />
            </div>
          </div>
        ))}
      </div>
    </Root>
  )
}

const Root = styled('div')`
  & .podcasts {
    &__header {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }

    &__all-shows-info {
      display: flex;
      flex-direction: row;
      gap: var(--lsd-spacing-16);
      margin-top: var(--lsd-spacing-24);
      margin-bottom: 120px;
    }

    &__shows {
      display: flex;
      flex-direction: column;
      gap: var(--lsd-spacing-32);
    }

    &__show {
      border-top: 1px solid rgb(var(--lsd-border-primary));
    }

    &__show-episodes {
      padding-top: var(--lsd-spacing-16);
    }
  }

  ${(props) =>
    lsdUtils.responsive(
      props.theme,
      'xs',
      'exact',
    )(css`
      .podcasts__header {
        border-bottom: none;

        h2 {
          ${lsdUtils.typography('h3')}
        }
      }

      .podcasts__shows {
        display: flex;
        flex-direction: column;
        margin-top: 0;
        gap: var(--lsd-spacing-32);
      }
    `)}

  ${(props) => lsdUtils.breakpoint(props.theme, 'xs', 'down')} {
    .post-card__title-text {
      font-size: var(--lsd-h4-fontSize) !important;
      line-height: var(--lsd-h4-lineHeight) !important;
    }
  }
`
