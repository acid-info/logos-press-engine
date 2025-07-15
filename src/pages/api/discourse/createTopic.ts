import type { NextApiRequest, NextApiResponse } from 'next'
import { discourseApi } from '../../../services/discourse.service'
import { strapiApi } from '../../../services/strapi'
import { ApiResponse } from '../../../types/data.types'
import { LPE } from '../../../types/lpe.types'

type RequestBody = {
  articleData: LPE.Article.Data
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { articleData }: RequestBody = req.body

    if (!articleData) {
      return res.status(400).json({ error: 'Article data is required' })
    }

    const result: ApiResponse<any> = await discourseApi.createArticleTopic(
      articleData,
    )

    if (result.data && !result.errors) {
      const updateResult = await strapiApi.updatePostDiscourseTopicId(
        articleData.id,
        result.data.topic_id,
      )

      if (updateResult.errors) {
        console.error(
          'Failed to update article with topic ID:',
          updateResult.errors,
        )
      }
    }

    if (result.errors) {
      return res.status(result.status || 500).json({ error: result.errors })
    }

    res.status(200).json(result)
  } catch (error) {
    console.error('Discourse create topic error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
