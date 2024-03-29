import { FooterSection } from '@/components/Footer/Footer.Section'
import { Typography } from '@acid-info/lsd-react'
import styled from '@emotion/styled'
import { siteConfigs } from '../../configs/site.configs'
import { lsdUtils } from '../../utils/lsd.utils'

export const FooterCopyright = () => (
  <OrgInfo>
    <Typography component="div" genericFontFamily="sans-serif" variant="body2">
      {siteConfigs.title} ©{new Date().getFullYear()}
    </Typography>
    <Typography component="div" genericFontFamily="sans-serif" variant="body2">
      All rights reserved.
    </Typography>
  </OrgInfo>
)

const OrgInfo = styled(FooterSection)`
  ${(props) => lsdUtils.breakpoint(props.theme, 'xs', 'down')} {
    margin-bottom: 72px;
  }
`
