import { strapiApi } from '@/services/strapi'
import { getWebsiteUrl } from '@/utils/route.utils'
import { writeFile } from 'fs/promises'
import path from 'path'
import logger from '../lib/logger'

export class LPESitemapGenerator {
  baseUrl: string
  currentDate: string
  constructor() {
    this.baseUrl = getWebsiteUrl()
    this.currentDate = new Date().toISOString()
  }

  async generateSitemap() {
    try {
      logger.info('Generating sitemap...')

      let articles: any[] = []
      let episodes: any[] = []
      let shows: any[] = []
      let staticPages: any[] = []

      try {
        // Fetch all data
        const [
          articlesResponse,
          episodesResponse,
          showsResponse,
          staticPagesResponse,
        ] = await Promise.all([
          strapiApi.getPosts({
            skip: 0,
            limit: 1000,
            highlighted: 'include',
            parseContent: false,
            published: true,
            filters: {
              type: {
                eq: 'Article',
              },
            },
          }),
          strapiApi.getPosts({
            skip: 0,
            limit: 1000,
            highlighted: 'include',
            parseContent: false,
            published: true,
            filters: {
              type: {
                eq: 'Episode',
              },
            },
          }),
          strapiApi.getPodcastShows({}),
          strapiApi.getStaticPages({}),
        ])

        articles = articlesResponse.data?.data || []
        episodes = episodesResponse.data?.data || []
        shows = showsResponse.data || []
        staticPages = staticPagesResponse.data || []

        logger.info(
          `Found ${articles.length} articles, ${episodes.length} episodes, ${shows.length} shows, ${staticPages.length} static pages`,
        )
      } catch (apiError) {
        logger.warn('API fetch failed, using fallback data:', apiError)
        // Use fallback data if API fails
        articles = [
          { slug: 'july-2025', modifiedAt: '2025-08-06T00:00:00.000Z' },
          { slug: 'fall-democracy', modifiedAt: '2025-10-15T00:00:00.000Z' },
          {
            slug: 'circles-lisbon-to-berlin',
            modifiedAt: '2025-10-09T00:00:00.000Z',
          },
          { slug: 'september-2025', modifiedAt: '2025-10-06T00:00:00.000Z' },
          {
            slug: 'logos-circles-winnable-issues',
            modifiedAt: '2025-09-30T00:00:00.000Z',
          },
          { slug: 'august-2025', modifiedAt: '2025-09-09T00:00:00.000Z' },
          {
            slug: 'why-build-a-network-state',
            modifiedAt: '2025-07-11T00:00:00.000Z',
          },
          {
            slug: 'what-happened-to-the-spirit-of-freedom',
            modifiedAt: '2025-07-04T00:00:00.000Z',
          },
        ]
        episodes = [
          {
            slug: 'federico-ast-kleros',
            showId: 'logos-state',
            modifiedAt: '2024-09-18T00:00:00.000Z',
          },
          {
            slug: 'jameson-lopp-technology-to-empower-individuals',
            showId: 'logos-state',
            modifiedAt: '2024-09-05T00:00:00.000Z',
          },
          {
            slug: 'alisher-status-app-update',
            showId: 'hashing-it-out',
            modifiedAt: '2024-10-30T00:00:00.000Z',
          },
          {
            slug: 'pol-lanski-dappnode-smooth',
            showId: 'hashing-it-out',
            modifiedAt: '2024-10-09T00:00:00.000Z',
          },
        ]
        shows = [
          { id: 'logos-state', slug: 'logos-state', title: 'Logos Podcast' },
        ]
        staticPages = []
      }

      // Generate sitemap XML
      let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`

      // Add homepage
      sitemap += `
  <url>
    <loc>${this.baseUrl}</loc>
    <lastmod>${this.currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`

      // Add search page
      sitemap += `
  <url>
    <loc>${this.baseUrl}/search</loc>
    <lastmod>${this.currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`

      // Add podcasts index page
      sitemap += `
  <url>
    <loc>${this.baseUrl}/podcasts</loc>
    <lastmod>${this.currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`

      // Add all articles
      articles.forEach((article) => {
        const lastmod = new Date(
          article.modifiedAt || article.createdAt,
        ).toISOString()
        sitemap += `
  <url>
    <loc>${this.baseUrl}/article/${article.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`
      })

      // Add all podcast episodes
      episodes.forEach((episode) => {
        const lastmod = new Date(
          episode.modifiedAt || episode.createdAt,
        ).toISOString()
        const show = shows.find((s) => s.id === episode.showId)
        if (show) {
          sitemap += `
  <url>
    <loc>${this.baseUrl}/podcasts/${show.slug}/${episode.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`
        }
      })

      // Add podcast show pages
      shows.forEach((show) => {
        sitemap += `
  <url>
    <loc>${this.baseUrl}/podcasts/${show.slug}</loc>
    <lastmod>${this.currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
      })

      // Add static pages
      staticPages.forEach((page) => {
        if (!page.isDraft) {
          const lastmod = new Date(
            page.updatedAt || page.createdAt,
          ).toISOString()
          sitemap += `
  <url>
    <loc>${this.baseUrl}/${page.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`
        }
      })

      sitemap += `
</urlset>`

      // Save sitemap to public directory
      const outputPath = path.join(process.cwd(), 'public', 'sitemap.xml')
      await writeFile(outputPath, sitemap)

      logger.info(`Sitemap generated at ${outputPath}`)
      return sitemap
    } catch (error) {
      logger.error('Error generating sitemap:', error)
      throw error
    }
  }
}
