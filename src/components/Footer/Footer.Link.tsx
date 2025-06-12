import { Typography } from '@acid-info/lsd-react'
import styled from '@emotion/styled'

export const FooterLink = styled(Typography)`
  width: fit-content;
  white-space: nowrap;

  &:not(:last-child) {
    &:after {
      display: inline-block;
      content: '•';
      margin-left: 8px;
    }
  }
`
