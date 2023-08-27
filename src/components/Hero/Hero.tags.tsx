import styled from '@emotion/styled'
import React from 'react'
import { LPETag } from '@/components/LPETag'

export type NavbarFilter = Partial<React.ComponentProps<typeof Container>> & {
  tags?: string[]
}

export const HeroTags: React.FC<NavbarFilter> = ({ tags = [], ...props }) => {
  return (
    <Container {...props}>
      <Tags>
        {tags.map((tag, index) => (
          <LPETag tag={tag} key={`tag-${index}`} />
        ))}
      </Tags>
    </Container>
  )
}

const Container = styled.div`
  margin: auto;
  width: 100%;
  text-align: center;
  display: flex;
  overflow: hidden;

  @media (max-width: 768px) {
  }
`

const Tags = styled.div`
  display: flex;
  width: 100%;
  overflow-x: auto;
  position: relative;
  scroll-snap-type: x mandatory;
  justify-content: center;
  gap: 0 8px;

  padding-top: 16px;

  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }

  > * {
    flex: 0 0 auto;
    span {
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  @media (max-width: ${(props) => props.theme.breakpoints.sm.width}px) {
    justify-content: flex-start;
    padding-left: var(--main-content-padding);
    padding-right: var(--main-content-padding);
  }
`