/** @jsxImportSource @emotion/react */
import { ArticleHeading } from '@/components/Article/Article.Heading'
import {
  extractAttributeFromHTML,
  extractIdFromFirstTag,
  extractInnerHtml,
} from '@/utils/html.utils'
import { HeadingElementsRef } from '@/utils/ui.utils'
import { Quote, Typography } from '@acid-info/lsd-react'
import { css } from '@emotion/react'
import styled from '@emotion/styled'
import clsx from 'clsx'
import React, { useMemo } from 'react'
import ReactPlayer from 'react-player'
import { LPE } from '../../types/lpe.types'
import { ArticleImageBlockWrapper } from './Article.ImageBlockWrapper'

function addTargetBlank(html: string) {
  return html.replace(
    /<a\s+(?![^>]*target=)/gi,
    '<a target="_blank" rel="noopener noreferrer" ',
  )
}

export const RenderArticleBlock = ({
  block,
  headingElementsRef,
}: {
  block: LPE.Article.ContentBlock
  activeId: string | null
  headingElementsRef?: HeadingElementsRef
  hide?: boolean
}) => {
  const content = useMemo(() => {
    switch (block.type) {
      case 'image':
        return <ArticleImageBlockWrapper image={block} order={block.order} />

      case 'text':
        switch (block.tagName) {
          case 'h1':
          case 'h2':
          case 'h3':
          case 'h4':
          case 'h5':
          case 'h6': {
            return <ArticleHeading block={block} />
          }
          case 'blockquote':
            return (
              <Quote mode="indented-line" genericFontFamily="serif">
                <Paragraph
                  variant="body1"
                  dangerouslySetInnerHTML={{
                    __html: extractInnerHtml(block.html),
                  }}
                />
              </Quote>
            )
          case 'p': {
            const isIframe = block.embed && block.labels.includes('embed')
            if (block.embed && isIframe) {
              return block.labels.includes('youtube_embed') ? (
                <IframeContainer isSimplecast={false}>
                  <ReactPlayer url={block.embed.src} />
                </IframeContainer>
              ) : (
                <IframeContainer
                  isSimplecast={true}
                  dangerouslySetInnerHTML={{
                    __html: block.embed.html,
                  }}
                />
              )
            }

            return (
              <Paragraph
                variant="body1"
                component={block.tagName as any}
                genericFontFamily="sans-serif"
                className={clsx(block.classNames)}
                css={css`
                  ${extractAttributeFromHTML(block.html, 'style', '')}
                `}
                dangerouslySetInnerHTML={{
                  __html: extractInnerHtml(addTargetBlank(block.html)),
                }}
              />
            )
          }
          case 'ul':
          case 'ol': {
            const Component = block.tagName as any as React.ComponentType<
              React.HTMLProps<HTMLUListElement>
            >
            return (
              <Paragraph
                variant="body1"
                component="div"
                genericFontFamily="sans-serif"
              >
                <Component
                  start={Number.parseInt(
                    extractAttributeFromHTML(block.html, 'start', '1'),
                    10,
                  )}
                  css={css`
                    ${extractAttributeFromHTML(block.html, 'style', '')}
                  `}
                  className={clsx(block.classNames)}
                  dangerouslySetInnerHTML={{
                    __html: extractInnerHtml(block.html),
                  }}
                />
              </Paragraph>
            )
          }
          default:
            return (
              <Paragraph
                component={block.tagName as any}
                genericFontFamily="sans-serif"
                css={css`
                  ${extractAttributeFromHTML(block.html, 'style', '')}
                `}
                className={clsx(block.classNames)}
                dangerouslySetInnerHTML={{
                  __html: extractInnerHtml(block.html),
                }}
              />
            )
        }
      default:
        return null
    }
  }, [block])

  const elementId = useMemo(
    () =>
      (block.type === 'text' && extractIdFromFirstTag(block.html)) ||
      `${block.type === 'image' ? 'i' : block.tagName}-${block.order}`,
    [block],
  )

  return (
    <>
      <span
        className="anchor"
        id={elementId}
        ref={(el) => {
          if (
            headingElementsRef &&
            el &&
            block.type === 'text' &&
            ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(block.tagName)
          )
            headingElementsRef.current[elementId] = el as HTMLHeadingElement
        }}
      />
      {content}
    </>
  )
}

const Paragraph = styled(Typography)`
  &.subtitle,
  &#p-2 {
    font-size: var(--lsd-h6-fontSize);
    line-height: var(--lsd-h6-lineHeight);
  }

  .u-font-weight-700,
  .u-font-weight-800,
  .u-font-weight-900,
  .u-font-weight-bold {
    font-weight: bold;
  }
  .u-font-style-italic {
    font-style: italic;
  }
  .u-text-decoration-underline {
    text-decoration: underline;
  }
  .u-text-decoration-line-through {
    text-decoration: line-through;
  }
  &.u-text-align-center {
    text-align: center;
  }

  & > strong {
    margin-bottom: 16px;
  }
`

const IframeContainer = styled.div<{ isSimplecast?: boolean }>`
  position: relative;
  padding-bottom: ${({ isSimplecast }) => (isSimplecast ? '30%' : '60%')};
  padding-top: 30px;
  height: 0;
  overflow: hidden;

  & > iframe,
  & > object,
  & > embed {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  & > div {
    width: 100% !important;
    height: unset !important;
    aspect-ratio: 16 / 9;
  }
`
