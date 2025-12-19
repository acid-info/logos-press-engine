import { useNewsletterSubscription } from '@/hooks/useNewsletterSubscription'
import { Button, TextField, Typography } from '@acid-info/lsd-react'
import styled from '@emotion/styled'
import Link from 'next/link'
import { useState } from 'react'

export const FooterCTAPanel = () => {
  const [email, setEmail] = useState('')
  const { isSubmitting, successMessage, errorMessage, subscribe, reset } =
    useNewsletterSubscription()

  const NEWSLETTER_ID = '6835cf08531d570001068824'

  const handleSubscribe = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await subscribe(email, NEWSLETTER_ID)
    window.umami?.track('subscribe', { source: 'footer' })
  }

  return (
    <Wrapper>
      <CTASection>
        <CTATypography
          component="h3"
          variant="h3"
          genericFontFamily="sans-serif"
          className="mobile-extra-margin"
        >
          Freedom needs builders
        </CTATypography>
        <Link
          href="https://logos.co/take-action"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            window.umami?.track('get-involved', { source: 'footer' })
          }}
        >
          <CTAButton type="button">
            <Typography variant="body1">Get Involved</Typography>
          </CTAButton>
        </Link>
      </CTASection>
      <CTASection onSubmit={handleSubscribe}>
        <CTATypography
          component="h3"
          variant="h3"
          genericFontFamily="sans-serif"
        >
          Stay ahead with the latest updates
        </CTATypography>
        <Bottom>
          <ActionsContainer>
            <StyledTextField
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting || !!successMessage}
              error={!!errorMessage}
              inputProps={{
                type: 'email',
                required: true,
              }}
            />
            <CTAButton
              type="submit"
              disabled={isSubmitting}
              className="subscribe"
            >
              <Typography variant="body1">
                {isSubmitting
                  ? 'Subscribing...'
                  : successMessage
                  ? 'Done'
                  : 'Subscribe'}
              </Typography>
            </CTAButton>
          </ActionsContainer>
          {successMessage && <Message>{successMessage}</Message>}
          {errorMessage && <Message>{errorMessage}</Message>}
        </Bottom>
      </CTASection>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 98px;

  @media only screen and (min-width: 768px) {
    flex-direction: row;
    margin-top: 50px;
    gap: 1rem;
  }

  @media only screen and (min-width: 576px) {
    gap: 1rem;
  }
`

const CTASection = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
  border-top: 1px solid rgb(var(--lsd-theme-primary));
  padding-top: 24px;

  @media only screen and (min-width: 576px) {
    gap: 32px;
  }
`

const CTATypography = styled(Typography)`
  font-weight: 300;
  font-size: 1.75rem;
  line-height: 2.25rem;

  &.mobile-extra-margin {
    margin-bottom: 8px;
  }

  @media only screen and (min-width: 576px) {
    &.mobile-extra-margin {
      margin-bottom: unset;
    }
  }
`

const Bottom = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const HiddenLink = styled.a`
  /* Visually hidden but accessible to screen readers and SEO */
  position: absolute !important;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  clip: rect(0 0 0 0);
  overflow: hidden;
  white-space: nowrap;
  border: 0;
`

const ActionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 40px;

  @media only screen and (min-width: 576px) {
    flex-direction: row;
    gap: 16px;
  }
`

const StyledTextField = styled(TextField)`
  width: 100%;

  input {
    text-decoration: none !important;
  }
`

const CTAButton = styled(Button)`
  height: 40px;
  width: 160px;

  &.subscribe {
    min-width: 146px;
    max-width: 146px;
  }

  span {
    font-size: 0.75rem;
    line-height: 1.25rem;
  }

  @media only screen and (min-width: 576px) {
    &.subscribe {
      max-width: unset;
    }
  }

  @media only screen and (min-width: 997px) {
    span {
      font-size: 1rem;
      line-height: 1.5rem;
    }
  }
`

const Message = styled(Typography)`
  font-size: 14px;
`
