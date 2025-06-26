import { copyConfigs } from '@/configs/copy.configs'
import { Typography } from '@acid-info/lsd-react'
import styled from '@emotion/styled'
import { useEffect, useRef } from 'react'
import { useWindowScroll } from 'react-use'
import { uiConfigs } from '../../configs/ui.configs'
import { useNavbarState } from '../../states/navbarState'
import { lsdUtils } from '../../utils/lsd.utils'

export type HeroProps = Partial<React.ComponentProps<typeof Container>> & {}

export const Hero: React.FC<HeroProps> = ({ ...props }) => {
  const ref = useRef<HTMLElement>(null)
  const scroll = useWindowScroll()
  const navbarState = useNavbarState()

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const rect = el.getBoundingClientRect()
    if (rect.bottom - uiConfigs.navbarRenderedHeight > 0) {
      navbarState.showTitle.get() && navbarState.setShowTitle(false)
    } else {
      !navbarState.showTitle.get() && navbarState.setShowTitle(true)
    }
  }, [scroll.y, navbarState])

  return (
    <Container {...props}>
      <Title genericFontFamily="serif" component="h1" variant="display2">
        <span>{copyConfigs.site.heroTitle[0]}</span>
        <span>{copyConfigs.site.heroTitle[1]}</span>
        <span ref={ref}>{copyConfigs.site.heroTitle[2]}</span>
      </Title>
      <Description component="div" variant="subtitle2">
        {copyConfigs.site.description}
      </Description>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px 0;
  align-items: center;

  position: relative;
  padding: 84px 0 108px;

  ${(props) => lsdUtils.breakpoint(props.theme, 'sm', 'down')} {
    padding: 8px 16px 32px 16px;
  }
`

const Title = styled(Typography)`
  text-align: center;
  text-transform: uppercase;

  ${(props) => lsdUtils.breakpoint(props.theme, 'sm', 'down')} {
    ${lsdUtils.typography('h3')}
  }
`

const Description = styled(Typography)`
  text-align: center;
  max-width: 410px;

  ${(props) => lsdUtils.breakpoint(props.theme, 'sm', 'down')} {
    ${lsdUtils.typography('subtitle4')}
  }
`
