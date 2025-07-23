import { NextApiRequest } from 'next'
import { getWebsiteUrl } from './route.utils'

const getProductionOrigin = () => {
  const origin = getWebsiteUrl()
  return origin.replace(/\/$/, '')
}

export const validateOrigin = (req: NextApiRequest): boolean => {
  const origin = req.headers.origin || req.headers.referer

  if (!origin) return false

  const originUrl = new URL(origin)

  if (
    originUrl.hostname === 'localhost' ||
    originUrl.hostname === '127.0.0.1' ||
    originUrl.hostname === 'dev-press.logos.co'
  ) {
    return true
  }

  const productionOrigin = getProductionOrigin()
  if (!productionOrigin) return false

  return origin.replace(/\/$/, '') === productionOrigin
}
