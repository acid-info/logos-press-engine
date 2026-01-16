export const POSTS_IMAGE_PLACEHOLDER_DIR = '/public/images/placeholders'

// Home page constants
export const FEATURED_ARTICLES_LIMIT = 5
export const FEATURED_EPISODES_LIMIT = 5
export const POSTS_TO_LOAD = 3
export const PODCAST_SHOWS_INFO_DISPLAY_LIMIT = 2

// API endpoints
export const SPACES_CALENDAR_API_URL =
  process.env.NEXT_PUBLIC_SITE_URL === 'https://press.logos.co'
    ? 'https://admin-acid.logos.co/api/calendar/public'
    : 'https://dev-admin-acid.logos.co/api/calendar/public'
