import { useState } from 'react'

const defaultErrorMessage =
  'There was an error submitting the form. Please try again.'

export const useNewsletterSubscription = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const subscribe = async (email: string, newsletterId: string) => {
    setIsSubmitting(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      if (email === 'successtest@successtest.com') {
        setSuccessMessage('Subscribed successfully!')
      } else if (email === 'errortest@errortest.com') {
        setErrorMessage(defaultErrorMessage)
      } else {
        const res = await fetch(
          `https://admin-acid.logos.co/api/admin/newsletters/subscribe`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              jsonrpc: '2.0',
              method: 'call',
              params: {
                email: email,
                type: 'logos',
                newsletter: newsletterId,
              },
            }),
          },
        )

        const data = await res.json()

        if (data?.result?.errors && data?.result?.errors[0]?.context?.length) {
          setErrorMessage(data?.result?.errors[0].context)
          return
        }

        setSuccessMessage('You successfully subscribed to the newsletter')
      }
    } catch (error) {
      setErrorMessage(defaultErrorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const reset = () => {
    setSuccessMessage('')
    setErrorMessage('')
  }

  return { isSubmitting, successMessage, errorMessage, subscribe, reset }
}
