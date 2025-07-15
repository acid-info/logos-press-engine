import { NextApiRequest, NextApiResponse } from 'next'
import { strapiApi } from '../../../services/strapi'
import { validateOrigin } from '../../../utils/security.utils'

interface RequestBody {
  articleId: string
  topicId: number
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  if (!validateOrigin(req)) {
    return res.status(403).json({ message: 'Forbidden: Invalid origin' })
  }

  const { articleId, topicId }: RequestBody = req.body

  if (!articleId || !topicId) {
    return res.status(400).json({ message: 'Missing articleId or topicId' })
  }

  try {
    const result = await strapiApi.updatePostDiscourseTopicId(
      articleId,
      topicId,
    )

    if (result.errors) {
      return res
        .status(500)
        .json({ message: 'Failed to update post', errors: result.errors })
    }

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('Error updating post discourse topic ID:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
