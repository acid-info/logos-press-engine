import { NextApiRequest, NextApiResponse } from 'next'
import { LPESitemapGenerator } from '../../services/sitemap.service'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const sitemapGenerator = new LPESitemapGenerator()
    const sitemap = await sitemapGenerator.generateSitemap()

    res.setHeader('Content-Type', 'application/xml')
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600')
    res.status(200).send(sitemap)
  } catch (error) {
    console.error('Error generating sitemap:', error)
    res.status(500).json({ message: 'Error generating sitemap' })
  }
}
