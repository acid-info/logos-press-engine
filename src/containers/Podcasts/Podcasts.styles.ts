import styled from '@emotion/styled'
import { PostsGrid } from '../../components/PostsGrid' // Updated path

export const postCardContentStyles = `
  .post-card__content {
    .show-details__container {
      margin-top: var(--lsd-spacing-16);
    }
  }
`

export const FeaturedPostsGrid = styled(PostsGrid)`
  ${postCardContentStyles}

  h3 {
    margin-top: var(--lsd-spacing-24);
  }

  .post-card__content {
    order: 2;

    .post-card__label {
      margin-top: var(--lsd-spacing-24) !important;
    }
  }

  .post-card__cover-image-wrapper {
    order: 1;
  }
`

export const SecondaryPostsGrid = styled(PostsGrid)`
  ${postCardContentStyles}

  h3 {
    margin-top: var(--lsd-spacing-16);
  }

  .post-card__label {
    margin-top: var(--lsd-spacing-16) !important;
  }
`
