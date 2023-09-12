/** @jsxImportSource @emotion/react */
import { ArticleHeading } from '@/components/Article/Article.Heading'
import {
  extractAttributeFromHTML,
  extractClassFromFirstTag,
  extractIdFromFirstTag,
  extractInnerHtml,
} from '@/utils/html.utils'
import { HeadingElementsRef } from '@/utils/ui.utils'
import { Quote, Typography } from '@acid-info/lsd-react'
import { css } from '@emotion/react'
import styled from '@emotion/styled'
import clsx from 'clsx'
import React from 'react'
import ReactPlayer from 'react-player'
import { LPE } from '../../types/lpe.types'
import { ArticleImageBlockWrapper } from './Article.ImageBlockWrapper'

export const RenderArticleBlock = ({
  block,
  headingElementsRef,
}: {
  block: LPE.Article.ContentBlock
  activeId: string | null
  headingElementsRef?: HeadingElementsRef
  hide?: boolean
}) => {
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
          return (
            <ArticleHeading
              block={block}
              headingElementsRef={headingElementsRef}
            />
          )
        }
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

          if (
            block.classNames.includes('subtitle') &&
            block.classNames.includes('u-with-margin-left')
          ) {
            return (
              <Quote
                mode="indented-line"
                genericFontFamily="serif"
                id={extractIdFromFirstTag(block.html) || `p-${block.order}`}
              >
                <Paragraph
                  variant="body1"
                  dangerouslySetInnerHTML={{
                    __html: extractInnerHtml(block.html),
                  }}
                />
              </Quote>
            )
          }

          return (
            <Paragraph
              variant="body1"
              component={block.tagName as any}
              genericFontFamily="sans-serif"
              className={clsx(
                extractClassFromFirstTag(block.html),
                block.classNames,
              )}
              id={extractIdFromFirstTag(block.html) || `p-${block.order}`}
              css={css`
                ${extractAttributeFromHTML(block.html, 'style', '')}
              `}
              dangerouslySetInnerHTML={{ __html: extractInnerHtml(block.html) }}
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
              id={extractIdFromFirstTag(block.html) || `p-${block.order}`}
            >
              <Component
                start={Number.parseInt(
                  extractAttributeFromHTML(block.html, 'start', '1'),
                  10,
                )}
                css={css`
                  ${extractAttributeFromHTML(block.html, 'style', '')}
                `}
                className={clsx(
                  extractClassFromFirstTag(block.html),
                  block.classNames,
                )}
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
              className={clsx(
                extractClassFromFirstTag(block.html),
                block.classNames,
              )}
              id={extractIdFromFirstTag(block.html) || `p-${block.order}`}
              dangerouslySetInnerHTML={{ __html: extractInnerHtml(block.html) }}
            />
          )
      }
    default:
      return null
  }
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
