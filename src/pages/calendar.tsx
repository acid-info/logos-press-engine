import { Calendar } from '@/components/Calendar'
import SEO from '@/components/SEO/SEO'
import { DefaultLayout } from '@/layouts/DefaultLayout'
import { api } from '@/services/api.service'
import { SpacesCalendarEvent } from '@/types/data.types'
import { GetServerSideProps } from 'next'
import NextAdapterPages from 'next-query-params'
import { ReactNode } from 'react'
import { QueryParamProvider } from 'use-query-params'

interface SpacesCalendarPageProps {
  events: SpacesCalendarEvent[]
}

export default function SpacesCalendarPage({
  events,
}: SpacesCalendarPageProps) {
  return (
    <>
      <SEO title="Calendar" pagePath="/calendar" />
      <Calendar events={events} />
    </>
  )
}

SpacesCalendarPage.getLayout = (page: ReactNode) => (
  <QueryParamProvider adapter={NextAdapterPages}>
    <DefaultLayout
      mainProps={{
        spacing: true,
      }}
    >
      {page}
    </DefaultLayout>
  </QueryParamProvider>
)

export const getServerSideProps: GetServerSideProps<
  SpacesCalendarPageProps
> = async () => {
  try {
    const response = await api.getSpacesCalendar()

    if (response.errors || !response.data.success) {
      return {
        props: {
          events: [],
        },
      }
    }

    const allEvents = response.data.data || []

    const uniqueEvents = Array.from(
      new Map(allEvents.map((event) => [event.id, event])).values(),
    )

    return {
      props: {
        events: uniqueEvents,
      },
    }
  } catch (error) {
    return {
      props: {
        events: [],
      },
    }
  }
}
