import { CalendarEvent } from '@/types/data.types'
import { lsdUtils } from '@/utils/lsd.utils'
import {
  getEventTypeLabel,
  isValidString,
  isValidTopic,
} from '@/utils/string.utils'
import { Typography } from '@acid-info/lsd-react'
import styled from '@emotion/styled'
import { format } from 'date-fns'

interface CalendarEventDetailsProps {
  selectedDate: Date
  events: CalendarEvent[]
}

export const CalendarEventDetails: React.FC<CalendarEventDetailsProps> = ({
  selectedDate,
  events,
}) => {
  return (
    <EventDetails>
      <Typography variant="h4" style={{ marginBottom: '1rem' }}>
        {format(selectedDate, 'MMMM d, yyyy')}
      </Typography>

      <EventList>
        {events.length > 0 ? (
          events.map((event) => {
            const formattedType = getEventTypeLabel(event.type)

            return (
              <EventItem key={event.id}>
                <EventItemHeader>
                  {formattedType && <EventType>{formattedType}</EventType>}
                  {formattedType && event.time && <EventDivider />}
                  {event.time && <EventTime>{event.time} (UTC)</EventTime>}
                </EventItemHeader>
                {isValidTopic(event.topic) && (
                  <EventTopic>{event.topic}</EventTopic>
                )}
                <EventMeta>
                  {isValidString(event.guest) && (
                    <div>- Guest: {event.guest}</div>
                  )}
                  {event.speakers.filter(isValidString).length > 0 && (
                    <div>
                      - Speakers:{' '}
                      {event.speakers.filter(isValidString).join(', ')}
                    </div>
                  )}
                  {isValidString(event.notes) && (
                    <div>- Notes: {event.notes}</div>
                  )}
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
            )
          })
        ) : (
          <Typography
            variant="body2"
            style={{ color: 'var(--lsd-palette-text-secondary)' }}
          >
            No events scheduled for this date.
          </Typography>
        )}
      </EventList>
    </EventDetails>
  )
}

const EventList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

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
  padding-bottom: 1rem;
  border-bottom: 1px solid rgb(var(--lsd-border-primary));

  &:last-child {
    padding-bottom: 0;
    border-bottom: none;
  }
`

const EventItemHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
`

const EventDivider = styled.div`
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: rgb(var(--lsd-border-primary));
`

const EventTime = styled.div`
  font-size: var(--lsd-body2-fontSize);
  line-height: var(--lsd-body2-lineHeight);
  color: var(--lsd-text-secondary);
`

const EventType = styled.div`
  padding: 4px 8px;
  font-size: var(--lsd-body2-fontSize);
  line-height: var(--lsd-body2-lineHeight);
  color: var(--lsd-text-secondary);
  border: 1px solid rgb(var(--lsd-border-primary));
  width: fit-content;
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
