import { uiConfigs } from '@/configs/ui.configs'
import styled from '@emotion/styled'
import { lsdUtils } from '../../utils/lsd.utils'

export const FooterSection = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  width: 50%;

  ${(props) => lsdUtils.breakpoint(props.theme, 'xs', 'down')} {
    width: 100%;
  }
`

export const FooterSectionContainer = styled.div`
  display: flex;
  position: relative;
  flex-direction: column;
  padding: 16px 0;
  margin: 312px auto;

  @media (max-width: ${uiConfigs.maxContainerWidth + 32}px) {
    margin-inline: 16px;
  }
`
