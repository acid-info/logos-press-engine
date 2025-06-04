import styled from '@emotion/styled'
import { Section, SectionProps } from '../Section/Section'

export type PodcastSectionProps = SectionProps

export const PodcastSection: React.FC<PodcastSectionProps> = ({
  children,
  ...props
}) => (
  <Section {...props}>
    <Container>{children}</Container>
  </Section>
)

const Container = styled.div`
  & > *:not(:first-child) {
    margin-top: var(--lsd-spacing-16);
  }

  .row {
    gap: var(--lsd-spacing-16);
  }
`
