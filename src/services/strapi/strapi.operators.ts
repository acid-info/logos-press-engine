import { gql } from '@apollo/client'

const POST_COMMON_ATTRIBUTES = gql`
  fragment PostCommonAttributes on Post {
    type
    title
    subtitle
    summary
    slug
    featured
    episode_number
    discourse_topic_id
    podcast_show {
      data {
        id
      }
    }
    cover_image {
      data {
        attributes {
          url
          width
          height
          caption
        }
      }
    }
    authors {
      data {
        id
        attributes {
          name
          email_address
        }
      }
    }
    publish_date
    publishedAt
    tags {
      data {
        id
        attributes {
          name
        }
      }
    }
  }
`

export const GET_PODCAST_SHOWS = gql`
  query GetPodcastShows(
    $filters: PodcastShowFiltersInput
    $pagination: PaginationArg
    $sort: [String]
    $publicationState: PublicationState
  ) {
    podcastShows(
      filters: $filters
      pagination: $pagination
      sort: $sort
      publicationState: $publicationState
    ) {
      data {
        id
        attributes {
          name
          slug
          description
          hosts {
            data {
              attributes {
                name
                email_address
              }
            }
          }
          logo {
            data {
              attributes {
                url
                width
                height
              }
            }
          }
        }
      }
    }
  }
`

export const GET_POSTS_QUERY = gql`
  ${POST_COMMON_ATTRIBUTES}

  query GetPosts(
    $filters: PostFiltersInput
    $pagination: PaginationArg
    $sort: [String]
    $publicationState: PublicationState
    $withContent: Boolean = false
  ) {
    posts(
      filters: $filters
      pagination: $pagination
      sort: $sort
      publicationState: $publicationState
    ) {
      meta {
        pagination {
          total
          page
          pageSize
          pageCount
        }
      }
      data {
        id
        attributes {
          ...PostCommonAttributes
          body @include(if: $withContent)
          credits @include(if: $withContent)
          channel @include(if: $withContent) {
            channel
            link
          }
        }
      }
    }
  }
`

export const GET_RELATED_POSTS_QUERY = gql`
  ${POST_COMMON_ATTRIBUTES}

  query GetRelatedPosts($id: ID!, $type: String!) {
    post(id: $id) {
      data {
        attributes {
          related_posts(
            publicationState: LIVE
            filters: { type: { eq: $type } }
          ) {
            data {
              id
              attributes {
                ...PostCommonAttributes
              }
            }
          }
        }
      }
    }
  }
`

export const SEARCH_POSTS_QUERY = gql`
  ${POST_COMMON_ATTRIBUTES}

  query SearchPosts(
    $query: String!
    $filters: PostFiltersInput
    $pagination: PaginationArg
  ) {
    search(query: $query) {
      posts(filters: $filters, pagination: $pagination) {
        data {
          id
          score
          attributes {
            ...PostCommonAttributes
          }
        }
      }
    }
  }
`

export const GET_STATIC_PAGES = gql`
  query GetStaticPages(
    $filters: PageFiltersInput
    $pagination: PaginationArg
    $sort: [String]
    $publicationState: PublicationState
    $withContent: Boolean = false
  ) {
    pages(
      sort: $sort
      filters: $filters
      pagination: $pagination
      publicationState: $publicationState
    ) {
      data {
        id
        attributes {
          slug
          title
          subtitle
          description
          publishedAt
          body @include(if: $withContent)
        }
      }
    }
  }
`
