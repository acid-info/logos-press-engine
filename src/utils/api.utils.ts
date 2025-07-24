import logger from '../lib/logger'

// Send 500 to client but log error internally
export const send500 = (res: any, error: any) => {
  logger.error({ error })
  res.status(500).json({ error: 'Internal server error' })
}
