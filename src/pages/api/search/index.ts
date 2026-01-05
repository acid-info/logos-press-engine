import type { NextApiRequest, NextApiResponse } from 'next'
import { strapiApi } from '../../../services/strapi'
import { LPE } from '../../../types/lpe.types'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  const {
    query: {
      q = '',
      tags: tagsString = '',
      type: typeString = '',
      skip: skipString = '0',
      limit: limitString = '15',
    },
  } = req

  const query = Array.isArray(q) ? q.join(' ').trim() : q.trim()

  const tags =
    typeof tagsString === 'string'
      ? tagsString
          .split(',')
          .map((tag: string) => tag.trim())
          .filter((t) => t.length > 0)
      : undefined

  const validPostTypes: string[] = Object.values(LPE.PostTypes)

  const type =
    typeof typeString === 'string'
      ? typeString
          .split(',')
          .map((t: string) => t.trim())
          .filter((t) => t.length > 0)
      : undefined

  const postTypes = Array.isArray(type)
    ? type.filter((t) => validPostTypes.includes(t))
    : []

  const skip = parseInt(
    Array.isArray(skipString) ? skipString[0] : skipString,
    10,
  )
  const limit = parseInt(
    Array.isArray(limitString) ? limitString[0] : limitString,
    10,
  )

  const result: {
    posts: LPE.Search.ResultItem[]
    blocks: LPE.Search.ResultItem[]
  } = {
    posts: [],
    blocks: [],
  }

  if (postTypes.length > 0) {
    const response = await strapiApi.searchPosts({
      tags,
      query,
      types: postTypes as LPE.PostType[],
      limit,
      skip,
    })

    result.posts.push(...(response.data ?? []))
  }

  if (query.trim().length === 0) {
    result.posts = result.posts.sort(
      (a, b) =>
        +new Date((b.data as LPE.Post.Document).publishedAt || 0) -
        +new Date((a.data as LPE.Post.Document).publishedAt || 0),
    )
  }

  res.status(200).json({
    data: result,
  })
}
