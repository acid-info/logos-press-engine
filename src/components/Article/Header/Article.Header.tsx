import { ArticleHeading } from '@/components/Article/Article.Heading'
import { Authors } from '@/components/Authors'
import { TagsAndSocial } from '@/components/TagsAndSocial'
import { useArticleContainerContext } from '@/containers/ArticleContainer.Context'
import { useIntersectionObserver } from '@/utils/ui.utils'
import { Typography } from '@acid-info/lsd-react'
import styled from '@emotion/styled'
import { ArticleBlocksOrders } from '../../../configs/data.configs'
import { LPE } from '../../../types/lpe.types'
import { lsdUtils } from '../../../utils/lsd.utils'
import { ArticleImageBlockWrapper } from '../Article.ImageBlockWrapper'
import ArticleStats from '../Article.Stats'
import ArticleSummary from './Article.Summary'

export type ArticleHeaderProps = LPE.Article.Data

const ArticleHeader = ({
  title,
  summary,
  subtitle,
  authors,
  coverImage,
  tags,
  modifiedAt,
  readingTime,
  content,
}: ArticleHeaderProps) => {
  const { setTocId } = useArticleContainerContext()
  const headingElementsRef = useIntersectionObserver(setTocId)

  console.log('ArticleHeader summary', summary.length)

  return (
    <ArticleHeaderContainer>
      <ArticleStats
        date={modifiedAt ? new Date(modifiedAt) : null}
        readingLength={readingTime}
      />
      <span
        id="title-anchor"
        ref={(ref) => {
          headingElementsRef.current['h-0'] = ref as HTMLHeadingElement
        }}
      ></span>
      <Typography variant="h1" component="h1" genericFontFamily="serif">
        {title}
      </Typography>
      {subtitle && (
        <ArticleSubtitle
          variant="body1"
          genericFontFamily="sans-serif"
          component="p"
        >
          {subtitle}
        </ArticleSubtitle>
      )}
      <AuthorsContainer>
        <Authors authors={authors} />
      </AuthorsContainer>

      <TagsAndSocial
        tags={tags.map((tag) => tag.name)}
        className={'articleTags'}
      />

      {coverImage && (
        <ArticleImageBlockWrapper
          image={coverImage}
          order={ArticleBlocksOrders.cover}
        />
      )}
      {summary && summary.length > 1 && (
        <ArticleSummary summary={summary} showLabel={false} />
      )}
    </ArticleHeaderContainer>
  )
}

const ArticleHeaderContainer = styled.header`
  margin-bottom: 24px;

  h1 {
    margin-bottom: 16px;
  }

  .mobileSummary {
    display: none;
  }

  .desktopSummary {
    display: block;
  }

  ${(props) => lsdUtils.breakpoint(props.theme, 'xs', 'down')} {
    .mobileSummary {
      display: block;
      p {
        font-size: var(--lsd-body3-fontSize);
        line-height: var(--lsd-body3-lineHeight);
        margin-bottom: 24px;
      }
      hr {
        display: none;
      }
    }

    .desktopSummary {
      display: none;
    }
  }
`

const CustomTypography = styled(Typography)`
  text-overflow: ellipsis;
  word-break: break-word;
  white-space: pre-wrap;
`

const ArticleTitle = styled(ArticleHeading)`
  margin-bottom: 16px;
  ${(props) => lsdUtils.breakpoint(props.theme, 'xs', 'down')} {
    margin-bottom: 8px;
  }
`

const ArticleSubtitle = styled(CustomTypography)`
  margin-bottom: 16px;

  ${(props) => lsdUtils.breakpoint(props.theme, 'xs', 'down')} {
    font-size: var(--lsd-subtitle1-fontSize);
  }
`

const AuthorsContainer = styled.div`
  //margin-block: 24px;
  margin-top: 16px;
  margin-bottom: 32px;

  ${(props) => lsdUtils.breakpoint(props.theme, 'xs', 'down')} {
    margin-top: 16px;
    margin-bottom: 24px;

    a[href^='mailto:'] {
      display: none;
    }
  }
`

export default ArticleHeader
