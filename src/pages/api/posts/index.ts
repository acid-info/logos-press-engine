import { Enum_Post_Type } from '@/lib/strapi/strapi.generated'
import type { NextApiRequest, NextApiResponse } from 'next'
import { strapiApi } from '../../../services/strapi'
import { parseInt } from '../../../utils/data.utils'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  const {
    query: { skip = 0, limit = 10, type },
  } = req

  const response = await strapiApi.getRecentPosts({
    skip: parseInt(skip as string, 0),
    limit: parseInt(limit as string, 10),
    highlighted: 'exclude',
    type: type as Enum_Post_Type,
  })

  res.status(200).json(response)
}
