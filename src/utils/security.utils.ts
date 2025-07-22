import { NextApiRequest } from 'next'

const getProductionOrigin = () =>
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')

export const validateOrigin = (req: NextApiRequest): boolean => {
  const origin = req.headers.origin || req.headers.referer

  if (!origin) return false

  const originUrl = new URL(origin)

  if (
    originUrl.hostname === 'localhost' ||
    originUrl.hostname === '127.0.0.1' ||
    originUrl.hostname === 'lpe-git-feat-articles-comments-acidinfo.vercel.app'
  ) {
    return true
  }

  const productionOrigin = getProductionOrigin()
  if (!productionOrigin) return false

  return origin.replace(/\/$/, '') === productionOrigin
}
