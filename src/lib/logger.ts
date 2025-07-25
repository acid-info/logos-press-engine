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

export const logger = pino({
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

export default logger
