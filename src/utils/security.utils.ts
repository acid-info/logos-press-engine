import { NextApiRequest } from 'next'

const getProductionOrigin = () =>
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')

export const validateOrigin = (req: NextApiRequest): boolean => {
  const origin = req.headers.origin || req.headers.referer

  if (!origin) return false

  const originUrl = new URL(origin)

  if (
    originUrl.hostname === 'localhost' ||
    originUrl.hostname === '127.0.0.1'
  ) {
    return true
  }

  const productionOrigin = getProductionOrigin()
  if (!productionOrigin) return false

  return origin.replace(/\/$/, '') === productionOrigin
}

export const createOriginCheckMiddleware = () => {
  return (req: NextApiRequest): { success: boolean; error?: string } => {
    if (!validateOrigin(req)) {
      return {
        success: false,
        error: 'Forbidden: Invalid origin',
      }
    }
    return { success: true }
  }
}
