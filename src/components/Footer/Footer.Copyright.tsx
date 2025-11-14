import { FooterSection } from '@/components/Footer/Footer.Section'
import { Typography } from '@acid-info/lsd-react'
import styled from '@emotion/styled'
import Link from 'next/link'

export const FooterCopyright = () => (
  <OrgInfo>
    <Link href="https://logos.co" target="_blank" rel="noopener noreferrer">
      <Typography
        component="div"
        genericFontFamily="sans-serif"
        variant="body2"
      >
        Logos
      </Typography>
    </Link>
  </OrgInfo>
)

const OrgInfo = styled(FooterSection)`
  align-self: start;
`
