import { uiConfigs } from '@/configs/ui.configs'
import styled from '@emotion/styled'
import { lsdUtils } from '../../utils/lsd.utils'

export type MainProps = {
  spacing?: 'default' | boolean
  contentPadding?: 'default' | boolean
  children?: React.ReactNode
} & Omit<
  React.ComponentProps<typeof Container>,
  'spacing' | 'contentPadding' | '$spacing' | '$contentPadding'
>

export const Main = ({
  spacing = 'default',
  contentPadding = 'default',
  children,
  ...props
}: MainProps) => {
  const $spacing = spacing === 'default' ? true : spacing
  const $contentPadding = contentPadding === 'default' ? true : contentPadding

  return (
    <Container $spacing={$spacing} $contentPadding={$contentPadding} {...props}>
      {children}
    </Container>
  )
}

const Container = styled.main<{
  $spacing: boolean
  $contentPadding: boolean
}>`
  --main-margin-top: ${(props) =>
    props.$spacing
      ? uiConfigs.postSectionMargin + uiConfigs.navbarRenderedHeight
      : uiConfigs.navbarRenderedHeight}px;
  --main-content-padding: 16px;

  margin-top: var(--main-margin-top);
  margin-left: auto;
  margin-right: auto;

  @media (max-width: ${uiConfigs.maxContainerWidth}px) {
    padding: 0
      ${(props) =>
        props.$contentPadding ? `var(--main-content-padding)` : '0'};
  }

  ${(props) => lsdUtils.breakpoint(props.theme, 'xs', 'down')} {
    --main-margin-top: ${({ $spacing }) =>
      $spacing
        ? uiConfigs.postSectionMobileMargin
        : uiConfigs.navbarRenderedHeight}px;
  }
`

export default Main
