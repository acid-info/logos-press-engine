import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import { strapiApi } from '../../../services/strapi'
import { LPE } from '../../../types/lpe.types'
import {
  normalizeQuery,
  normalizeString,
  parseCommaSeparated,
} from '../../../utils/string.utils'

const validPostTypes = Object.values(LPE.PostTypes) as string[]

const DEFAULT_SKIP = 0
const DEFAULT_LIMIT = 15
const MAX_LIMIT = 100
const RADIX = 10

const searchQuerySchema = z.object({
  q: z
    .preprocess(normalizeQuery, z.string())
    .default('')
    .transform((val) => val.trim()),
  tags: z
    .preprocess(normalizeString, z.string())
    .default('')
    .transform((val) => {
      const parsed = parseCommaSeparated(val)
      return parsed.length > 0 ? parsed : undefined
    }),
  type: z
    .preprocess(normalizeString, z.string())
    .default('')
    .transform((val) =>
      parseCommaSeparated(val).filter((t) => validPostTypes.includes(t)),
    ),
  skip: z
    .preprocess(
      (val) => (Array.isArray(val) ? val[0] : val) ?? `${DEFAULT_SKIP}`,
      z.string(),
    )
    .default(`${DEFAULT_SKIP}`)
    .transform((val) => parseInt(val, RADIX))
    .refine((val) => !isNaN(val), { message: 'skip must be a number' })
    .pipe(z.number().int().min(0)),
  limit: z
    .preprocess(
      (val) => (Array.isArray(val) ? val[0] : val) ?? `${DEFAULT_LIMIT}`,
      z.string(),
    )
    .default(`${DEFAULT_LIMIT}`)
    .transform((val) => parseInt(val, RADIX))
    .refine((val) => !isNaN(val), { message: 'limit must be a number' })
    .pipe(z.number().int().min(1).max(MAX_LIMIT)),
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  try {
    const validated = searchQuerySchema.parse({
      q: req.query.q,
      tags: req.query.tags,
      type: req.query.type,
      skip: req.query.skip,
      limit: req.query.limit,
    })

    const { q: query, tags, type: postTypes, skip, limit } = validated

    const result: {
      posts: LPE.Search.ResultItem[]
      blocks: LPE.Search.ResultItem[]
    } = {
      posts: [],
      blocks: [],
    }

    let total = 0
    let hasMore = false

    if (postTypes.length > 0) {
      const response = await strapiApi.searchPosts({
        tags,
        query,
        types: postTypes as LPE.PostType[],
        limit,
        skip,
      })

      if (response.data) {
        result.posts.push(...(response.data.data ?? []))
        total = response.data.total
        hasMore = response.data.hasMore
      }
    }

    if (query.trim().length === 0) {
      result.posts = result.posts.sort(
        (a, b) =>
          +new Date((b.data as LPE.Post.Document).publishedAt || 0) -
          +new Date((a.data as LPE.Post.Document).publishedAt || 0),
      )
    }

    res.status(200).json({
      data: {
        ...result,
        total,
        hasMore,
      },
    })
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Invalid query parameters',
        details: error.issues,
      })
      return
    }
    console.error('Search API error:', error)
    res.status(500).json({
      error: 'Internal server error',
    })
  }
}
