import { Button, ChevronRightIcon, Typography } from '@acid-info/lsd-react'
import styled from '@emotion/styled'
import Image from 'next/image'
import Link from 'next/link'
import { LPE } from '../../types/lpe.types'
import { lsdUtils } from '../../utils/lsd.utils'
import { getPostLink } from '../../utils/route.utils'
import { Grid, GridItem } from '../Grid/Grid'
import PodcastHost from './Podcast.Host'

interface Props {
  shows: LPE.Podcast.Show[]
}

export default function PodcastsLists({ shows }: Props) {
  return (
    <PodcastListsContainer>
      {shows &&
        shows.map((show, idx) => {
          const isEven = idx % 2 === 0
          return (
            <ShowCardContainer key={show.id} className="w-8">
              <ShowCard
                isEven={isEven}
                href={getPostLink('podcast', { showSlug: show.slug })}
              >
                <div>
                  <Top>
                    <ShowInfoContainer>
                      <Image
                        src={show.logo.url}
                        width={36}
                        height={36}
                        alt={show.logo.alt}
                      />
                      <ShowInfo>
                        <ColoredText isEven={isEven} variant="subtitle2">
                          {show.title}
                        </ColoredText>
                      </ShowInfo>
                    </ShowInfoContainer>
                  </Top>
                  <ShowData $isEven={isEven}>
                    <Description
                      variant="h4"
                      dangerouslySetInnerHTML={{ __html: show.description }}
                    />
                    <PodcastHost show={show} />
                  </ShowData>
                </div>
                <ShowButton
                  size="small"
                  isEven={isEven}
                  icon={
                    <ChevronRightIcon
                      color={isEven ? 'secondary' : 'primary'}
                    />
                  }
                >
                  <ColoredText isEven={isEven} variant="body3">
                    Podcast page
                  </ColoredText>
                </ShowButton>
              </ShowCard>
            </ShowCardContainer>
          )
        })}
    </PodcastListsContainer>
  )
}

const PodcastListsContainer = styled(Grid)`
  gap: var(--lsd-spacing-16);
`

const ShowCardContainer = styled(GridItem)``

const ShowCard = styled(Link, {
  shouldForwardProp: (prop) => prop !== 'isEven',
})<{ isEven: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 24px;
  border: 1px solid rgb(var(--lsd-text-primary));
  box-sizing: border-box;
  height: 100%;
  min-height: 516px;
  text-decoration: none;
  background-color: ${(props) =>
    props.isEven
      ? 'rgb(var(--lsd-surface-secondary))'
      : 'rgb(var(--lsd-surface-primary))'};

  ${(props) => lsdUtils.breakpoint(props.theme, 'sm', 'down')} {
    min-height: unset;
  }
`

const ShowInfoContainer = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;

  ${(props) => lsdUtils.breakpoint(props.theme, 'xs', 'down')} {
    gap: 8px;
  }
`

const ShowInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`

const Row = styled.div`
  display: flex;
  gap: 8px;
`

const Top = styled(Row)`
  justify-content: space-between;
`

const ShowData = styled.div<{ $isEven: boolean }>`
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;

  p,
  span {
    color: ${(props) =>
      props.$isEven
        ? 'rgb(var(--lsd-text-secondary))'
        : 'rgb(var(--lsd-text-primary))'};
  }

  ${(props) => lsdUtils.breakpoint(props.theme, 'xs', 'down')} {
    margin-bottom: var(--lsd-spacing-40);
  }
`

const ColoredText = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'isEven',
})<{ isEven: boolean }>`
  color: ${(props) =>
    props.isEven
      ? 'rgb(var(--lsd-text-secondary))'
      : 'rgb(var(--lsd-text-primary))'};
`

const Description = styled(Typography)`
  ${(props) => lsdUtils.breakpoint(props.theme, 'xs', 'down')} {
    ${lsdUtils.typography('subtitle1')}
  }
`

const ShowButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'isEven',
})<{ isEven: boolean }>`
  width: auto;
  align-self: flex-start;

  border: 1px solid
    ${(props) =>
      props.isEven
        ? 'rgb(var(--lsd-border-secondary))'
        : 'rgb(var(--lsd-border-primary))'};

  ${(props) => lsdUtils.breakpoint(props.theme, 'xs', 'down')} {
    align-self: stretch;
    justify-content: space-between;
    padding: 10px 0px 10px 18px !important;

    .lsd-button__text * {
      ${lsdUtils.typography('label1', true)}
    }
  }
`
