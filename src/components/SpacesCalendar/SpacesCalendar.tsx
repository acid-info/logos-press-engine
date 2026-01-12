import { SpacesCalendarEvent } from '@/types/data.types'
import { Button, Dropdown, Typography } from '@acid-info/lsd-react'
import styled from '@emotion/styled'
import {
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  startOfMonth,
} from 'date-fns'
import { useEffect, useMemo, useState } from 'react'
import { NumberParam, useQueryParams } from 'use-query-params'
import { SpacesCalendarEventDetails } from './SpacesCalendar.EventDetails'

const years = [2025, 2026]

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
interface SpacesCalendarProps {
  events: SpacesCalendarEvent[]
}

export const SpacesCalendar: React.FC<SpacesCalendarProps> = ({ events }) => {
  const today = new Date()

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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  useEffect(() => {
    if (getInitialDate.getTime() !== currentDate.getTime()) {
      setCurrentDate(getInitialDate)
    }
  }, [getInitialDate, currentDate])

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const firstDayOfWeek = monthStart.getDay()
  const daysBeforeMonth = Array.from({ length: firstDayOfWeek }, (_, i) => {
    const date = new Date(monthStart)
    date.setDate(date.getDate() - firstDayOfWeek + i)
    return date
  })

  const lastDayOfWeek = monthEnd.getDay()
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
      if (!topicsForDate.has(event.topic)) {
        topicsForDate.add(event.topic)
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
          <Button variant="outlined" size="small" onClick={goToPreviousMonth}>
            ←
          </Button>
          <Button variant="outlined" size="small" onClick={goToToday}>
            Today
          </Button>
          <Button variant="outlined" size="small" onClick={goToNextMonth}>
            →
          </Button>
        </MonthNavigation>
      </CalendarHeader>

      <CalendarGrid>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
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
            >
              <DayNumber>{format(day, 'd')}</DayNumber>
              {hasEvent && (
                <EventList>
                  {dayEvents.map((event) => (
                    <EventTitle key={event.id} title={event.topic}>
                      {event.topic}
                    </EventTitle>
                  ))}
                </EventList>
              )}
            </DayCell>
          )
        })}
      </CalendarGrid>

      {selectedDate && (
        <SpacesCalendarEventDetails
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
`

const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`

const DateSelectors = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`

const MonthNavigation = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
`

const DayHeader = styled.div`
  text-align: center;
  padding: 0.5rem;
  font-weight: 600;
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
`

const DayNumber = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
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
`
