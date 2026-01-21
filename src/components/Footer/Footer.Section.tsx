import { uiConfigs } from '@/configs/ui.configs'
import styled from '@emotion/styled'

export const FooterSection = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  width: 100%;

  @media only screen and (min-width: 768px) {
    width: 50%;
  }
`

export const FooterSectionContainer = styled.div`
  display: flex;
  position: relative;
  flex-direction: column;
  padding: 16px 0 40px 0;
  margin: 200px auto;
  margin-inline: 16px;
  gap: 96px;

  @media only screen and (min-width: 1200px) {
    padding-bottom: 0;
  }

  @media only screen and (min-width: ${uiConfigs.maxContainerWidth + 33}px) {
    margin-inline: auto;
  }
`
