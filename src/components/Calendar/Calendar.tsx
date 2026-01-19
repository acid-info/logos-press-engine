import { SpacesCalendarEvent } from '@/types/data.types'
import { lsdUtils } from '@/utils/lsd.utils'
import { formatEventType, isValidTopic } from '@/utils/string.utils'
import { Button, Dropdown, Typography } from '@acid-info/lsd-react'
import styled from '@emotion/styled'
import {
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  startOfMonth,
} from 'date-fns'
import { useEffect, useMemo, useRef, useState } from 'react'
import { NumberParam, useQueryParams } from 'use-query-params'
import { CalendarEventDetails } from './Calendar.EventDetails'

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]
interface CalendarProps {
  events: SpacesCalendarEvent[]
  error?: string | null
}

export const Calendar: React.FC<CalendarProps> = ({ events, error }) => {
  const today = new Date()

  const years = useMemo(() => {
    const baseYear = 2025
    if (events.length === 0) {
      return [baseYear, baseYear + 1]
    }

    const mostRecentEvent = events.reduce((latest, event) => {
      const eventDate = new Date(event.date)
      const latestDate = new Date(latest.date)
      return eventDate > latestDate ? event : latest
    })

    const mostRecentYear = new Date(mostRecentEvent.date).getFullYear()
    const maxYear = Math.max(baseYear, mostRecentYear)

    if (maxYear === baseYear) {
      return [baseYear, baseYear + 1]
    }

    return [maxYear - 1, maxYear]
  }, [events])

  const [query, setQuery] = useQueryParams({
    year: NumberParam,
    month: NumberParam,
  })

  const getInitialDate = useMemo(() => {
    if (query.year && query.month) {
      const year = query.year
      const month = query.month - 1
      if (year >= 1900 && year <= 2100 && month >= 0 && month <= 11) {
        return new Date(year, month, 1)
      }
    }
    return new Date()
  }, [query.year, query.month])

  const [currentDate, setCurrentDate] = useState(getInitialDate)
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    () => new Date(),
  )
  const currentDateRef = useRef(currentDate)

  useEffect(() => {
    currentDateRef.current = currentDate
  }, [currentDate])

  useEffect(() => {
    if (getInitialDate.getTime() !== currentDateRef.current.getTime()) {
      setCurrentDate(getInitialDate)
    }
  }, [getInitialDate])

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const firstDayOfWeek = (monthStart.getDay() + 6) % 7

  const daysBeforeMonth = Array.from({ length: firstDayOfWeek }, (_, i) => {
    const date = new Date(monthStart)
    date.setDate(date.getDate() - firstDayOfWeek + i)
    return date
  })

  const lastDayOfWeek = (monthEnd.getDay() + 6) % 7

  const daysAfterMonth = Array.from({ length: 6 - lastDayOfWeek }, (_, i) => {
    const date = new Date(monthEnd)
    date.setDate(date.getDate() + i + 1)
    return date
  })

  const allDays = [...daysBeforeMonth, ...daysInMonth, ...daysAfterMonth]

  const eventsByDate = useMemo(() => {
    const map = new Map<string, SpacesCalendarEvent[]>()
    const seenTopics = new Map<string, Set<string>>()

    events.forEach((event) => {
      const dateKey = event.date

      if (!map.has(dateKey)) {
        map.set(dateKey, [])
        seenTopics.set(dateKey, new Set())
      }

      const topicsForDate = seenTopics.get(dateKey)!
      const topicKey = event.topic || formatEventType(event.type)
      if (!topicsForDate.has(topicKey)) {
        topicsForDate.add(topicKey)
        map.get(dateKey)!.push(event)
      }
    })
    return map
  }, [events])

  const getEventsForDate = useMemo(() => {
    return (date: Date): SpacesCalendarEvent[] => {
      const dateKey = format(date, 'yyyy-MM-dd')
      return eventsByDate.get(dateKey) || []
    }
  }, [eventsByDate])

  const selectedEvents = useMemo(() => {
    if (!selectedDate) return []

    return getEventsForDate(selectedDate)
  }, [selectedDate, getEventsForDate])

  const updateDate = (newDate: Date) => {
    setCurrentDate(newDate)
    setQuery({
      year: newDate.getFullYear(),
      month: newDate.getMonth() + 1,
    })
  }

  const goToPreviousMonth = () => {
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1,
    )
    updateDate(newDate)
  }

  const goToNextMonth = () => {
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      1,
    )
    updateDate(newDate)
  }

  const goToToday = () => {
    updateDate(new Date(today.getFullYear(), today.getMonth(), 1))
    setSelectedDate(today)
  }

  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() + 1

  const handleYearChange = (value: string | string[]) => {
    const year = Array.isArray(value) ? parseInt(value[0]) : parseInt(value)
    if (!isNaN(year)) {
      updateDate(new Date(year, currentMonth - 1, 1))
    }
  }

  const handleMonthChange = (value: string | string[]) => {
    const month = Array.isArray(value) ? parseInt(value[0]) : parseInt(value)
    if (!isNaN(month)) {
      updateDate(new Date(currentYear, month - 1, 1))
    }
  }

  return (
    <CalendarContainer>
      {error && (
        <ErrorMessage>
          <Typography variant="body2">{error}</Typography>
        </ErrorMessage>
      )}
      <CalendarHeader>
        <DateSelectors>
          <Dropdown
            size="small"
            placeholder="Year"
            triggerLabel={currentYear.toString()}
            options={years.map((year) => ({
              name: year.toString(),
              value: year.toString(),
            }))}
            value={currentYear.toString()}
            onChange={handleYearChange}
          />
          <Dropdown
            size="small"
            placeholder="Month"
            triggerLabel={months[currentMonth - 1]}
            options={months.map((month, index) => ({
              name: month,
              value: (index + 1).toString(),
            }))}
            value={currentMonth.toString()}
            onChange={handleMonthChange}
          />
        </DateSelectors>
        <MonthNavigation>
          <Button
            variant="outlined"
            size="small"
            onClick={goToPreviousMonth}
            aria-label="Previous month"
          >
            ←
          </Button>
          <Button variant="outlined" size="small" onClick={goToToday}>
            Today
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={goToNextMonth}
            aria-label="Next month"
          >
            →
          </Button>
        </MonthNavigation>
      </CalendarHeader>

      <CalendarGrid>
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
          <DayHeader key={day}>
            <Typography variant="body2">{day}</Typography>
          </DayHeader>
        ))}
        {allDays.map((day, index) => {
          const dayEvents = getEventsForDate(day)
          const hasEvent = dayEvents.length > 0
          const isToday = isSameDay(day, today)
          const isOtherMonth =
            index < firstDayOfWeek ||
            index >= firstDayOfWeek + daysInMonth.length
          const isSelected = selectedDate ? isSameDay(day, selectedDate) : false

          return (
            <DayCell
              key={day.toISOString()}
              hasEvent={hasEvent}
              isToday={isToday}
              isOtherMonth={isOtherMonth}
              isSelected={isSelected}
              onClick={() => setSelectedDate(day)}
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  setSelectedDate(day)
                }
              }}
            >
              <DayNumber>{format(day, 'd')}</DayNumber>
              {hasEvent && (
                <EventList>
                  {dayEvents.map((event) => {
                    const displayText = isValidTopic(event.topic)
                      ? event.topic!
                      : formatEventType(event.type)
                    return (
                      <EventTitle key={event.id} title={displayText}>
                        {displayText}
                      </EventTitle>
                    )
                  })}
                </EventList>
              )}
            </DayCell>
          )
        })}
      </CalendarGrid>

      {selectedDate && (
        <CalendarEventDetails
          selectedDate={selectedDate}
          events={selectedEvents}
        />
      )}
    </CalendarContainer>
  )
}

const CalendarContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;

  ${({ theme }) => lsdUtils.breakpoint(theme, 'sm', 'down')} {
    padding-block: 1rem;
    padding-inline: 0;
  }
`

const ErrorMessage = styled.div`
  margin-bottom: 1rem;
  padding: 1rem;
  border: 1px solid rgb(var(--lsd-border-primary));
  background-color: rgba(255, 0, 0, 0.1);
  border-color: rgba(255, 0, 0, 0.3);

  ${({ theme }) => lsdUtils.breakpoint(theme, 'sm', 'down')} {
    margin-bottom: 0.5rem;
    padding: 0.75rem;
  }
`

const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;

  ${({ theme }) => lsdUtils.breakpoint(theme, 'sm', 'down')} {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
    margin-bottom: 1rem;
  }
`

const DateSelectors = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;

  ${({ theme }) => lsdUtils.breakpoint(theme, 'sm', 'down')} {
    width: 100%;
    justify-content: center;
  }
`

const MonthNavigation = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;

  ${({ theme }) => lsdUtils.breakpoint(theme, 'sm', 'down')} {
    width: 100%;
    justify-content: center;
  }
`

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;

  ${({ theme }) => lsdUtils.breakpoint(theme, 'sm', 'down')} {
    gap: 0.25rem;
  }
`

const DayHeader = styled.div`
  text-align: center;
  padding: 0.5rem;
  font-weight: 600;

  ${({ theme }) => lsdUtils.breakpoint(theme, 'sm', 'down')} {
    padding: 0.25rem;
    font-size: 0.75rem;
  }
`

const DayCell = styled.div<{
  hasEvent?: boolean
  isToday?: boolean
  isOtherMonth?: boolean
  isSelected?: boolean
}>`
  min-height: 100px;
  padding: 0.5rem;
  border: 1px solid rgb(var(--lsd-border-primary));
  cursor: pointer;
  background-color: ${({ hasEvent, isToday, isSelected }) =>
    isSelected
      ? 'rgba(var(--lsd-theme-primary), 0.2)'
      : isToday
      ? 'rgba(var(--lsd-theme-primary), 0.1)'
      : hasEvent
      ? 'rgba(var(--lsd-theme-primary), 0.05)'
      : 'transparent'};
  opacity: ${({ isOtherMonth }) => (isOtherMonth ? 0.3 : 1)};
  position: relative;
  transition: background-color 0.2s;
  display: flex;
  flex-direction: column;

  &:hover {
    background-color: rgba(var(--lsd-theme-primary), 0.1);
  }

  ${({ theme }) => lsdUtils.breakpoint(theme, 'sm', 'down')} {
    min-height: 60px;
    padding: 0.25rem;
  }
`

const DayNumber = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.25rem;

  ${({ theme }) => lsdUtils.breakpoint(theme, 'sm', 'down')} {
    font-size: 0.75rem;
    margin-bottom: 0.125rem;
  }
`

const EventList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-top: 0.25rem;
  flex: 1;
`

const EventTitle = styled.p`
  font-size: var(--lsd-body2-fontSize);
  line-height: var(--lsd-body2-lineHeight);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  word-break: break-word;

  ${({ theme }) => lsdUtils.breakpoint(theme, 'sm', 'down')} {
    font-size: 0.65rem;
    line-height: 1.2;
    -webkit-line-clamp: 2;
  }
`
