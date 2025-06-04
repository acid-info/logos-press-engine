import { FooterSection } from '@/components/Footer/Footer.Section'
import { Typography } from '@acid-info/lsd-react'
import styled from '@emotion/styled'
import { lsdUtils } from '../../utils/lsd.utils'

export const FooterCopyright = () => (
  <OrgInfo>
    <Typography component="div" genericFontFamily="sans-serif" variant="body2">
      Logos
    </Typography>
  </OrgInfo>
)

const OrgInfo = styled(FooterSection)`
  ${(props) => lsdUtils.breakpoint(props.theme, 'xs', 'down')} {
    margin-bottom: 72px;
  }
`
