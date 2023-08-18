import styled from '@emotion/styled'
import { LPE } from '../../types/lpe.types'
import { Button, Typography } from '@acid-info/lsd-react'
import Link from 'next/link'
import PodcastHost from './Podcast.Host'
import Image from 'next/image'

interface Props {
  shows: LPE.Podcast.Show[]
}

export default function PodcastsLists({ shows }: Props) {
  return (
    <PodcastListsContainer>
      {shows &&
        shows.map((show) => (
          <PodcastCard key={show.id}>
            <Image
              src={show.logo.url}
              width={56}
              height={56}
              alt={show.logo.alt}
            />
            <Typography variant="h3">{show.title}</Typography>
            <Row>
              <PodcastHost show={show} />
              <Typography variant="body2">•</Typography>
              <Typography variant="body2">
                {show.numberOfEpisodes} EP
              </Typography>
            </Row>
            <Description variant="body2">{show.description}</Description>
            <Link href={`/podcasts/${show.slug}`}>
              <Button>Go to the show page</Button>
            </Link>
          </PodcastCard>
        ))}
    </PodcastListsContainer>
  )
}

const PodcastListsContainer = styled.div`
  display: flex;
  gap: 16px;
`

const PodcastCard = styled.div`
  display: flex;
  flex-direction: column;
  padding: 24px;
  border: 1px solid rgb(var(--lsd-text-primary));
  width: 50%;
`

const Row = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`

const Description = styled(Typography)`
  margin-bottom: 16px;
`