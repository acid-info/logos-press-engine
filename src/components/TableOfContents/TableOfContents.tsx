import { uiConfigs } from '@/configs/ui.configs'
import { useArticleContainerContext } from '@/containers/ArticleContainer.Context'
import { useSticky } from '@/utils/ui.utils'
import { Typography } from '@acid-info/lsd-react'
import styled from '@emotion/styled'
import { UnbodyGoogleDoc } from '@/lib/unbody/unbody.types'

export type TableOfContentsProps = Pick<UnbodyGoogleDoc, 'toc'>

type Props = {
  contents?: TableOfContentsProps['toc']
}

export default function TableOfContents({ contents, ...props }: Props) {
  const articleContainer = useArticleContainerContext()
  const { tocIndex, setTocIndex } = articleContainer
  const dy = uiConfigs.navbarRenderedHeight + uiConfigs.postMarginTop

  const { sticky, stickyRef, height } = useSticky<HTMLDivElement>(dy)

  const handleSectionClick = (index: number) => {
    //@ts-ignore
    const section = document.getElementById(contents[index].href.substring(1))
    section?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest',
    })
    setTocIndex(index)
  }

  return (
    <Container
      dy={dy}
      height={height}
      ref={stickyRef}
      {...props}
      className={sticky ? 'sticky' : ''}
    >
      <Title variant="body3">Contents</Title>
      {/* @ts-ignore */}
      {contents?.map((content, index) => (
        <Section
          active={index === tocIndex}
          onClick={() => handleSectionClick(index)}
          key={index}
        >
          <Typography variant="body3" genericFontFamily="sans-serif">
            {content.title}
          </Typography>
        </Section>
      ))}
    </Container>
  )
}

const Container = styled.aside<{ dy: number; height: number }>`
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  width: 162px;
  box-sizing: border-box;
  height: fit-content;
  position: sticky;
  top: ${(p) => `${p.dy}px`};
  margin-left: 16px;

  &.sticky {
    top: ${uiConfigs.navbarRenderedHeight + 78 + 1}px;
    z-index: 100;
    height: ${(p) => `${p.height}px`};
  }

  // temporary breakpoint
  @media (max-width: 1024px) {
    display: none;
  }
`

const Title = styled(Typography)`
  margin-bottom: 24px;
`

const Section = styled.section<{ active: boolean }>`
  display: flex;
  padding: 8px 0 8px 12px;
  border-left: ${(p) =>
    p.active
      ? '1px solid rgb(var(--lsd-border-primary))'
      : '1px solid transparent'};
  cursor: pointer;
`
