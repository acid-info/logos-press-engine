import pino from 'pino'

const isDevelopment = process.env.NODE_ENV === 'development'
const logLevel = process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info')

const transport = isDevelopment
  ? {
      target: 'pino-pretty',
      options: {
        colorize: true,
        levelFirst: true,
        translateTime: 'HH:MM:ss',
        ignore: 'pid,hostname',
      },
    }
  : undefined

declare global {
  // Reuse the logger across Next.js dev hot reloads so transports do not
  // attach duplicate listeners to stdout/stderr.
  // eslint-disable-next-line no-var
  var __lpeLogger__: pino.Logger | undefined
}

export const logger =
  global.__lpeLogger__ ||
  pino({
    level: logLevel,
    transport,
    formatters: {
      level: (label) => ({ level: label.toUpperCase() }),
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    ...(isDevelopment
      ? {}
      : { base: { pid: process.pid, hostname: require('os').hostname() } }),
  })

if (isDevelopment) {
  global.__lpeLogger__ = logger
}

export default logger
