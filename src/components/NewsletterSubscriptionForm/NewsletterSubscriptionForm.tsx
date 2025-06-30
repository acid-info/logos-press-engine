import {
  Button,
  CheckIcon,
  ErrorIcon,
  TextField,
  Typography,
} from '@acid-info/lsd-react'
import styled from '@emotion/styled'

type NewsletterSubscriptionFormProps = React.HTMLAttributes<HTMLDivElement> & {
  handleFormSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isSubmitting: boolean
  errorMessage: string
  successMessage: string
  onClose: () => void
}

export default function NewsletterSubscriptionForm({
  handleFormSubmit,
  isSubmitting,
  errorMessage,
  successMessage,
  onClose,
}: NewsletterSubscriptionFormProps) {
  const disabled = isSubmitting

  return (
    <FormContainer>
      {errorMessage && (
        <ErrorMessageContainer>
          <MessageContainer>
            <ErrorIcon color="primary" />
            <SubmitionInfoMessage variant="body2">
              {errorMessage}
            </SubmitionInfoMessage>
          </MessageContainer>
        </ErrorMessageContainer>
      )}

      {successMessage && (
        <SuccessMessageContainer>
          <MessageContainer>
            <CheckIcon color="primary" />
            <SubmitionInfoMessage variant="body2">
              {successMessage}
            </SubmitionInfoMessage>
          </MessageContainer>
          <SubscribeButton variant="outlined" onClick={onClose}>
            Home page
          </SubscribeButton>
        </SuccessMessageContainer>
      )}

      <EmailSubscribeForm
        onSubmit={handleFormSubmit}
        hideForm={!!successMessage}
      >
        {/* <StyledTextField
          id="firstName"
          inputProps={{ name: 'firstName', disabled }}
          placeholder="First name or pseudonym"
          disabled={disabled}
        /> */}

        <TextFieldWrapper>
          <StyledTextField
            id="email"
            inputProps={{
              name: 'email',
              type: 'email',
              required: true,
              disabled,
            }}
            placeholder="Email address"
            disabled={disabled}
            hasError={!!errorMessage}
          />
          {errorMessage && (
            <ErrorIconWrapper>
              <ErrorIcon color="primary" />
            </ErrorIconWrapper>
          )}
        </TextFieldWrapper>

        <SubscribeButton
          variant="filled"
          type="submit"
          size="large"
          disabled={disabled}
        >
          {isSubmitting ? 'Subscribing...' : 'Subscribe'}
        </SubscribeButton>
      </EmailSubscribeForm>
    </FormContainer>
  )
}

const FormContainer = styled.div`
  width: 430px;
  max-width: 90%;
  margin-top: 64px;
`

const MessageContainer = styled.div`
  box-sizing: border-box;

  display: flex;
  align-items: center;

  border: 1px solid rgb(var(--lsd-border-primary));
  padding: 11px 18px;

  width: 100%;

  svg {
    flex-shrink: 0;
  }
`

const SubmitionInfoMessage = styled(Typography)`
  padding-left: 14px;
`

const ErrorMessageContainer = styled.div`
  margin-bottom: 40px;
`

const SuccessMessageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 48px;
  align-items: center;
`

const EmailSubscribeForm = styled.form<{
  hideForm: boolean
}>`
  display: ${({ hideForm }) => (hideForm ? 'none' : 'flex')};
  justify-content: center;
  align-items: center;
  flex-direction: column;

  gap: 48px;
  width: 100%;
  margin-bottom: 60px;
`

const TextFieldWrapper = styled.div`
  position: relative;
  width: 100%;
`

const ErrorIconWrapper = styled.div`
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  z-index: 1;
`

const StyledTextField = styled(TextField)<{ hasError?: boolean }>`
  width: 100%;

  ${({ hasError }) =>
    hasError &&
    `
    input {
      padding-right: 40px;
    }
  `}
`

const SubscribeButton = styled(Button)`
  &.lsd-button {
    margin-right: 0 !important;
    height: auto !important;
    padding: 19px 40px !important;
  }
`
