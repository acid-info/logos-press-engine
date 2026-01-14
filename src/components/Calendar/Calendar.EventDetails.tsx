import { SpacesCalendarEvent } from '@/types/data.types'
import { lsdUtils } from '@/utils/lsd.utils'
import { formatEventType, isValidTopic } from '@/utils/string.utils'
import { Typography } from '@acid-info/lsd-react'
import styled from '@emotion/styled'
import { format } from 'date-fns'

interface CalendarEventDetailsProps {
  selectedDate: Date
  events: SpacesCalendarEvent[]
}

export const CalendarEventDetails: React.FC<CalendarEventDetailsProps> = ({
  selectedDate,
  events,
}) => {
  const hasTime = events.some((event) => event.time)
  const firstEventWithTime = events.find((event) => event.time)

  return (
    <EventDetails>
      <Typography variant="h4" style={{ marginBottom: '1rem' }}>
        {format(selectedDate, 'MMMM d, yyyy')}
        {hasTime && firstEventWithTime?.time && (
          <> {firstEventWithTime.time} (UTC)</>
        )}
      </Typography>

      {events.length > 0 ? (
        events.map((event) => (
          <EventItem key={event.id}>
            <EventType>{formatEventType(event.type)}</EventType>
            {isValidTopic(event.topic) && (
              <EventTopic>{event.topic}</EventTopic>
            )}
            <EventMeta>
              {event.guest && <div>- Guest: {event.guest}</div>}
              {event.speakers.length > 0 && (
                <div>- Speakers: {event.speakers.join(', ')}</div>
              )}
              {event.notes && <div>- Notes: {event.notes}</div>}
              {event.links && event.links.length > 0 && (
                <div>
                  - Links:{' '}
                  {event.links.map((link, index) => (
                    <span key={index}>
                      <EventLink
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {link}
                      </EventLink>
                      {index < (event.links?.length || 0) - 1 && ', '}
                    </span>
                  ))}
                </div>
              )}
            </EventMeta>
          </EventItem>
        ))
      ) : (
        <Typography
          variant="body2"
          style={{ color: 'var(--lsd-palette-text-secondary)' }}
        >
          No events scheduled for this date.
        </Typography>
      )}
    </EventDetails>
  )
}

const EventDetails = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  border: 1px solid rgb(var(--lsd-border-primary));

  ${({ theme }) => lsdUtils.breakpoint(theme, 'sm', 'down')} {
    margin-top: 1rem;
    padding: 1rem;
  }
`

const EventItem = styled.div`
  border-bottom: 1px solid rgb(var(--lsd-border-primary));

  &:last-child {
    border-bottom: none;
  }
`

const EventType = styled.div`
  padding: 4px 8px;
  font-size: var(--lsd-body2-fontSize);
  line-height: var(--lsd-body2-lineHeight);
  color: var(--lsd-text-secondary);
  border: 1px solid rgb(var(--lsd-border-primary));
  width: fit-content;
  margin-bottom: 12px;
`

const EventTopic = styled.h3`
  ${lsdUtils.typography('h4')}
`

const EventMeta = styled.div`
  font-size: 0.875rem;
  color: var(--lsd-palette-text-secondary);
`

const EventLink = styled.a`
  color: rgb(var(--lsd-theme-primary));
  text-decoration: underline;
  word-break: break-all;

  &:hover {
    text-decoration: none;
  }
`
