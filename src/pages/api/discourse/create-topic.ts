import type { NextApiRequest, NextApiResponse } from 'next'
import { discourseApi } from '../../../services/discourse.service'
import { strapiApi } from '../../../services/strapi'
import { ApiResponse } from '../../../types/data.types'
import { LPE } from '../../../types/lpe.types'
import { send500 } from '../../../utils/api.utils'
import { validateOrigin } from '../../../utils/security.utils'

type RequestBody = {
  articleId: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  if (req.method !== 'POST') return send500(res, 'Method not allowed')

  if (!validateOrigin(req)) return send500(res, 'Forbidden: Invalid origin')

  try {
    const { articleId }: RequestBody = req.body
    if (!articleId) return send500(res, 'Article id is required')

    if (!/^\d+$/.test(articleId)) {
      return send500(res, 'Article id must be a positive or zero number')
    }

    // Check if article exists in Strapi to avoid misuse of the API
    const articleCheck = await strapiApi.getPosts({
      id: articleId,
      limit: 1,
    })
    if (
      !articleCheck.data ||
      !articleCheck.data.data ||
      articleCheck.data.data.length === 0
    ) {
      return send500(res, `Article not found in Strapi: ${articleId}`)
    }

    const strapiArticle = articleCheck.data.data[0] as LPE.Article.Data
    const result: ApiResponse<any> = await discourseApi.createArticleTopic(
      strapiArticle,
    )
    if (result.data && !result.errors) {
      const updateResult = await strapiApi.updatePostDiscourseTopicId(
        strapiArticle.id,
        result.data.topic_id,
      )
      if (updateResult.errors)
        send500(
          res,
          `Failed to update article with topic ID: ${updateResult.errors}`,
        )
    }
    if (result.errors) return send500(res, result.errors)

    res.status(200).json(result)
  } catch (error) {
    send500(res, error)
  }
}
