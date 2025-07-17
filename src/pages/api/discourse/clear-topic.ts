// Discourse webhook endpoint to clear discourse_topic_id from a Strapi post
// when the corresponding discourse topic is deleted

import crypto from 'crypto'
import type { NextApiRequest, NextApiResponse } from 'next'
import { strapiApi } from '../../../services/strapi'
import { send500 } from '../../../utils/api.utils'

const DISCOURSE_WEBHOOK_SECRET = process.env.DISCOURSE_WEBHOOK_SECRET || ''

function verifyDiscourseSignature(
  payload: string,
  signature: string,
  secret: string,
): boolean {
  if (!signature || !secret) return false

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex')

  const providedSignature = signature.replace('sha256=', '')

  const expectedBuffer = Buffer.from(expectedSignature, 'hex')
  const providedBuffer = Buffer.from(providedSignature, 'hex')

  if (expectedBuffer.length !== providedBuffer.length) {
    return false
  }

  return crypto.timingSafeEqual(
    new Uint8Array(expectedBuffer),
    new Uint8Array(providedBuffer),
  )
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  if (req.method !== 'POST') return send500(res, 'Method not allowed')

  try {
    const signature = req.headers['x-discourse-event-signature'] as string
    const payload = JSON.stringify(req.body)

    if (!signature) {
      return send500(res, 'Missing X-Discourse-Event-Signature header')
    }

    if (!DISCOURSE_WEBHOOK_SECRET) {
      return send500(res, 'Discourse webhook secret not configured')
    }

    if (
      !verifyDiscourseSignature(payload, signature, DISCOURSE_WEBHOOK_SECRET)
    ) {
      return send500(res, 'Invalid signature')
    }

    const { topic } = req.body
    if (!topic?.id) {
      return send500(res, 'Topic ID is required in payload')
    }

    const topicId = parseInt(topic.id, 10)
    if (isNaN(topicId)) {
      return send500(res, 'Topic ID must be a valid number')
    }

    const postsQuery = await strapiApi.getPosts({
      filters: {
        discourse_topic_id: {
          eq: topicId,
        },
      },
      limit: 1,
    })

    if (postsQuery.errors) {
      return send500(res, `Failed to query posts: ${postsQuery.errors}`)
    }

    const post = postsQuery.data?.data?.[0]
    if (!post) {
      return res
        .status(200)
        .json({ success: true, message: 'No post found for this topic id' })
    }

    const updateResult = await strapiApi.updatePostDiscourseTopicId(
      post.id,
      null,
    )
    if (updateResult.errors) {
      return send500(
        res,
        `Failed to clear discourse_topic_id: ${updateResult.errors}`,
      )
    }

    res.status(200).json({
      success: true,
      message: `Cleared discourse_topic_id for post ${post.id}`,
    })
  } catch (error) {
    send500(res, error)
  }
}
