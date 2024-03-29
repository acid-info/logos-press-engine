import type { NextApiRequest, NextApiResponse } from 'next'
import { strapiApi } from '../../../../../services/strapi'
import { parseInt } from '../../../../../utils/data.utils'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  const {
    query: { skip = 0, limit = 10, showSlug },
  } = req

  const response = await strapiApi.getLatestEpisodes({
    highlighted: 'exclude',
    skip: parseInt(skip, 0),
    limit: parseInt(limit, 10),
    showSlug: Array.isArray(showSlug) ? showSlug[0] : showSlug,
  })

  res.status(200).json(response)
}
