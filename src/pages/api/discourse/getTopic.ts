import type { NextApiRequest, NextApiResponse } from 'next'
import { discourseApi } from '../../../services/discourse.service'
import { ApiResponse } from '../../../types/data.types'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { topicId } = req.query

    if (!topicId || typeof topicId !== 'string') {
      return res.status(400).json({ error: 'Topic ID is required' })
    }

    const topicIdNumber = parseInt(topicId, 10)

    if (isNaN(topicIdNumber)) {
      return res.status(400).json({ error: 'Topic ID must be a valid number' })
    }

    const result: ApiResponse<any> = await discourseApi.getTopic(topicIdNumber)

    if (result.errors) {
      return res.status(result.status || 500).json({ error: result.errors })
    }

    res.status(200).json(result)
  } catch (error) {
    console.error('Discourse get topic error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
