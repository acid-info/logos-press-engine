import { FullscreenDialog } from '@/components/FullscreenDialog'
import { LogosIcon } from '@/components/Icons/LogosIcon'
import NewsletterSubscriptionForm from '@/components/NewsletterSubscriptionForm/NewsletterSubscriptionForm'
import { copyConfigs } from '@/configs/copy.configs'
import { useNewsletterSubscription } from '@/hooks/useNewsletterSubscription'
import { lsdUtils } from '@/utils/lsd.utils'
import { Typography } from '@acid-info/lsd-react'
import styled from '@emotion/styled'
import { useEffect } from 'react'

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
  const { isSubmitting, successMessage, errorMessage, subscribe, reset } =
    useNewsletterSubscription()

  // Reset states when the dialog is closed.
  useEffect(() => {
    if (!isOpen) {
      reset()
    }
  }, [isOpen, reset])

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const email = e.currentTarget.email.value
    const NEWSLETTER_ID = '6835cf08531d570001068824'
    await subscribe(email, NEWSLETTER_ID)
    // @ts-ignore
    window.umami.track('subscribe', { source: 'navbar-newsletter-dialog' })
  }

  return (
    <FullscreenDialog isOpen={isOpen} onClose={onClose} {...props}>
      <LogosIconAndTitleContainer>
        <LogosIcon color="primary" width="36px" height="36px" />
        <PressLogoType variant={'h1'} genericFontFamily={'serif'}>
          {copyConfigs.navbar.title}
        </PressLogoType>
        <Typography variant="body2">Subscribe for updates</Typography>
      </LogosIconAndTitleContainer>

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
  flex-direction: column;
  align-items: center;
  gap: 16px;
`
