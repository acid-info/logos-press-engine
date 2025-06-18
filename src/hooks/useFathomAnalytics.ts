import Router from 'next/router'
import { useEffect } from 'react'

const useFathomAnalytics = () => {
  useEffect(() => {
    if (window.fathom) {
      window.fathom('trackPageview')
    }

    const handleRouteChange = () => {
      if (window.fathom) {
        window.fathom('trackPageview')
      }
    }

    Router.events.on('routeChangeComplete', handleRouteChange)

    return () => {
      Router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [])
}

export default useFathomAnalytics
