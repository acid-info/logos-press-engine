import { FullscreenDialog } from '@/components/FullscreenDialog'
import { LogosIcon } from '@/components/Icons/LogosIcon'
import NewsletterSubscriptionForm from '@/components/NewsletterSubscriptionForm/NewsletterSubscriptionForm'
import { copyConfigs } from '@/configs/copy.configs'
import { lsdUtils } from '@/utils/lsd.utils'
import { Typography } from '@acid-info/lsd-react'
import styled from '@emotion/styled'
import { useEffect, useState } from 'react'

type NewsletterSubscriptionDialogProps =
  React.HTMLAttributes<HTMLDivElement> & {
    isOpen: boolean
    onClose: () => void
  }

export type SubscribeFormData = {
  email: string
  firstName: string
  lastName: string
}

export default function NewsletterSubscriptionDialog({
  isOpen,
  onClose,
  ...props
}: NewsletterSubscriptionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const defaultErrorMessage =
    'There was an error submitting the form. Please try again.'

  // Reset states when the dialog is closed.
  useEffect(() => {
    if (!isOpen) {
      if (successMessage) {
        setSuccessMessage('')
      }

      if (errorMessage) {
        setErrorMessage('')
      }
    }
  }, [isOpen, successMessage, errorMessage])

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    setIsSubmitting(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      // const firstName = e.currentTarget.firstName.value || ''
      const email = e.currentTarget.email.value

      if (email === 'successtest@successtest.com') {
        setSuccessMessage('Subscribed successfully!')
      } else if (email === 'errortest@errortest.com') {
        setErrorMessage(defaultErrorMessage)
      } else {
        const NEWSLETTER_ID = '679a07eedeb47200012eebc5'

        const res = await fetch(
          `https://odoo.logos.co/website_mass_mailing/subscribe_ghost`,
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
                subscription_type: 'email',
                newsletter: NEWSLETTER_ID,
              },
            }),
          },
        )

        const data = await res.json()

        if (data?.result?.errors && data?.result?.errors[0]?.context?.length) {
          setErrorMessage(data?.result?.errors[0].context)
          return
        }

        setSuccessMessage('Thank you for subscribing!')
      }
    } catch (error) {
      setErrorMessage(defaultErrorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <FullscreenDialog isOpen={isOpen} onClose={onClose} {...props}>
      <LogosIconAndTitleContainer>
        <LogosIcon color="primary" width="36px" height="36px" />
        <PressLogoType variant={'h1'} genericFontFamily={'serif'}>
          {copyConfigs.navbar.title}
        </PressLogoType>
      </LogosIconAndTitleContainer>
      <Typography variant="body2">Subscribe for updates</Typography>

      <NewsletterSubscriptionForm
        handleFormSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        successMessage={successMessage}
        onClose={onClose}
      />
    </FullscreenDialog>
  )
}

const PressLogoType = styled(Typography)`
  text-transform: uppercase;
  font-size: 30px;
  line-height: 36px;

  ${(props) => lsdUtils.breakpoint(props.theme, 'xs', 'down')} {
    font-size: 20px;
    line-height: 26px;
  }
`

const LogosIconAndTitleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;

  margin: 16px 0;
`
