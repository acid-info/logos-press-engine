import type { NextApiRequest, NextApiResponse } from 'next'
import { discourseApi } from '../../../services/discourse.service'
import { ApiResponse } from '../../../types/data.types'
import { send500 } from '../../../utils/api.utils'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  if (req.method !== 'GET') return send500(res, 'Method not allowed')

  try {
    const { topicId } = req.query
    if (!topicId || typeof topicId !== 'string')
      return send500(res, 'Topic ID is required')

    const topicIdNumber = parseInt(topicId, 10)
    if (isNaN(topicIdNumber))
      return send500(res, 'Topic ID must be a valid number')

    const result: ApiResponse<any> = await discourseApi.getTopic(topicIdNumber)
    if (result.errors) return send500(res, result.errors)

    res.status(200).json(result)
  } catch (error) {
    send500(res, error)
  }
}
