import { isValid, parse } from 'date-fns'

const EVENT_TIME_FORMATS = ['HH:mm', 'H:mm', 'h:mm a', 'hh:mm a'] as const

type CalendarDateTimeSource = {
  date: string
  time?: string
}

const getDateParts = (date: string) => {
  const [year, month, day] = date.split('-').map(Number)
  if (!year || !month || !day) return null
  return { year, month, day }
}

const getTimeParts = (
  time?: string,
): { hours: number; minutes: number } | null => {
  const trimmedTime = time?.trim()
  if (!trimmedTime) return null

  const referenceDate = new Date(2000, 0, 1)
  for (const timeFormat of EVENT_TIME_FORMATS) {
    const parsedTime = parse(trimmedTime, timeFormat, referenceDate)
    if (!isValid(parsedTime)) continue

    return {
      hours: parsedTime.getHours(),
      minutes: parsedTime.getMinutes(),
    }
  }

  return null
}

export const getBrowserUtcLabel = (
  referenceDate: Date = new Date(),
): string => {
  const totalMinutes = -referenceDate.getTimezoneOffset()
  const sign = totalMinutes >= 0 ? '+' : '-'
  const absoluteMinutes = Math.abs(totalMinutes)
  const hours = Math.floor(absoluteMinutes / 60)
  const minutes = absoluteMinutes % 60

  if (minutes === 0) return `UTC${sign}${hours}`
  return `UTC${sign}${hours}:${String(minutes).padStart(2, '0')}`
}

export const getEventLocalDateTime = (
  event: CalendarDateTimeSource,
): Date | null => {
  const dateParts = getDateParts(event.date)
  if (!dateParts) return null

  const { year, month, day } = dateParts
  const timeParts = getTimeParts(event.time)
  const hours = timeParts?.hours ?? 0
  const minutes = timeParts?.minutes ?? 0

  return new Date(Date.UTC(year, month - 1, day, hours, minutes))
}

export const getEventTimeMinutesSinceMidnight = (
  time?: string,
): number | null => {
  const timeParts = getTimeParts(time)
  if (!timeParts) return null

  return timeParts.hours * 60 + timeParts.minutes
}
