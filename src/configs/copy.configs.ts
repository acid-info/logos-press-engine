import { siteConfigs } from '@/configs/site.configs'

export const copyConfigs = {
  site: {
    title: siteConfigs.title,
    heroTitle: siteConfigs.heroTitle,
    description: siteConfigs.description,
    keywords: siteConfigs.keywords.join(','),
  },
  navbar: {
    title: 'Logos Press Engine',
  },
  search: {
    searchbarPlaceholders: {
      global: () => 'Search LPE...',
      article: () => `Search on this page or go to`,
    },
    views: {
      default: 'List',
      explore: 'Explore',
    },
    results: {
      noResults: 'No results found',
      results: 'results',
    },
    labels: {
      topResults: 'Top results',
      articlesAndPodcasts: 'Articles and podcasts',
      relatedContent: 'Related content',
    },
    filterTags: [
      'Privacy',
      'Security',
      'Liberty',
      'Censorship',
      'Decentralization',
      'Openness / inclusivity',
      'Innovation',
      'Interview',
      'Podcast',
      'Law',
    ],
  },
}
