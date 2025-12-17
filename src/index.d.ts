import { Theme as LSDTheme } from '@acid-info/lsd-react'
import { NextPage } from 'next'
import React from 'react'

declare module '@emotion/react' {
  export interface Theme extends LSDTheme {}
}

declare module 'next' {
  export type CustomNextPage<T = any, I = any> = NextPage<T, I> & {
    getLayout?: (page: React.ReactNode) => any
  }
}

declare global {
  interface Fathom {
    (command: string, ...args: any[]): void
    q?: Array<any>
  }

  interface Umami {
    track: (eventName: string, eventData?: Record<string, any>) => void
  }

  interface Window {
    fathom?: Fathom
    umami?: Umami
  }
}
