import { useNewsletterSubscription } from '@/hooks/useNewsletterSubscription'
import { Button, TextField, Typography } from '@acid-info/lsd-react'
import styled from '@emotion/styled'
import Link from 'next/link'
import { useState } from 'react'
import { lsdUtils } from '../../utils/lsd.utils'

export const FooterCTAPanel = () => {
  const [email, setEmail] = useState('')
  const { isSubmitting, successMessage, errorMessage, subscribe, reset } =
    useNewsletterSubscription()

  const NEWSLETTER_ID = '6835cf08531d570001068824'

  const handleSubscribe = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await subscribe(email, NEWSLETTER_ID)
  }

  return (
    <Wrapper>
      <CTASection>
        <CTATypography
          component="h3"
          variant="h3"
          genericFontFamily="sans-serif"
        >
          Freedom needs builders
        </CTATypography>
        <StyledLink href="https://discord.gg/logosnetwork">
          <CTAButton>
            <Typography variant="body1">Get Involved</Typography>
          </CTAButton>
        </StyledLink>
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
            <CTAButton type="submit" disabled={isSubmitting}>
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
  margin-top: 50px;
  display: flex;
  gap: 1rem;
  padding-bottom: 70px;

  ${(props) => lsdUtils.breakpoint(props.theme, 'xs', 'down')} {
    flex-direction: column;
    margin-top: 72px;
  }
`

const CTASection = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 32px;
  border-top: 1px solid rgb(var(--lsd-theme-primary));
  padding-top: 16px;
`

const CTATypography = styled(Typography)`
  font-weight: 300;
`

const Bottom = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const StyledLink = styled(Link)`
  width: fit-content;
`

const ActionsContainer = styled.div`
  display: flex;
  gap: 16px;
`

const StyledTextField = styled(TextField)`
  width: 100%;

  input {
    text-decoration: none !important;
  }
`

const CTAButton = styled(Button)`
  height: 40px;
  min-width: 146px;
`

const Message = styled(Typography)`
  font-size: 14px;
`
