import { NavbarLinks } from '@/components/NavBar/Navbar.Links'
import { NavbarMobileMenu } from '@/components/NavBar/Navbar.MobileMenu'
import { SocialMediaKit } from '@/components/NavBar/Navbar.SocialMediaKit'
import { ThemeSwitch } from '@/components/ThemeSwitch/ThemeSwitch'
import { NavLinksItems } from '@/configs/data.configs'
import { uiConfigs } from '@/configs/ui.configs'
import { useThemeState } from '@/states/themeState'
import {
  CloseIcon,
  IconButton,
  MenuIcon,
  SearchIcon,
} from '@acid-info/lsd-react'
import styled from '@emotion/styled'
import clsx from 'clsx'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { NavbarState, useNavbarState } from '../../states/navbarState'
import { lsdUtils } from '../../utils/lsd.utils'
import { LogosIcon } from '../Icons/LogosIcon'
import { SubscribeButton } from '../SubscribeButton'

export interface NavBarProps {
  defaultState?: Partial<NavbarState>
}

export default function NavBar({ defaultState }: NavBarProps) {
  const state = useNavbarState(defaultState)
  const themeState = useThemeState()
  const { pathname } = useRouter()
  const [hide, setHide] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const isSearchPage = pathname === '/search'
  const className = pathname.split('/')[1] + '_page'

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu)
  }

  useEffect(() => {
    setShowMobileMenu(false)
  }, [pathname])

  useEffect(() => {
    defaultState && state.state.set((value) => ({ ...value, ...defaultState }))
  }, [defaultState])

  const searchButton =
    state.showSearchButton.get() &&
    (!!state.onSearch ? (
      <IconButton size={'small'} onClick={() => state.onSearch!()}>
        <SearchIcon color={'primary'} />
      </IconButton>
    ) : (
      <Link href={'/search'}>
        <IconButton
          size={'small'}
          variant={isSearchPage ? 'filled' : 'outlined'}
        >
          <SearchIcon color={'primary'} />
        </IconButton>
      </Link>
    ))

  const buttons = (
    <>
      <Buttons>
        <div className="navbar-right-links">
          <NavbarLinks
            links={NavLinksItems.filter((item) => item?.position === 'right')}
          />
        </div>
        <SubscribeButton />
        <ThemeSwitch
          toggle={themeState.toggleMode}
          mode={themeState.get().mode}
        />
        {searchButton}
      </Buttons>
      <Buttons mobile>
        <IconButton size={'small'} onClick={toggleMobileMenu}>
          {showMobileMenu ? (
            <CloseIcon color="primary" />
          ) : (
            <MenuIcon color={'primary'} />
          )}
        </IconButton>
      </Buttons>
    </>
  )

  return (
    <Container className={clsx(hide && 'hide', className)}>
      <NavBarContainer bordered={state.showTitle.get()}>
        <Buttons mobile>{searchButton}</Buttons>
        <NavLinksContainer>
          <NavbarLinks
            links={NavLinksItems.filter((item) => item?.position !== 'right')}
          />
        </NavLinksContainer>
        <Centered>
          <Logo href="/">
            <LogosIcon color="primary" width="48px" height="48px" />
          </Logo>
        </Centered>
        <ControlsContainer>
          <SocialMediaKitContainer>
            <SocialMediaKit />
          </SocialMediaKitContainer>
          {buttons}
        </ControlsContainer>
        {showMobileMenu && <NavbarMobileMenu />}
      </NavBarContainer>
    </Container>
  )
}

const SocialMediaKitContainer = styled.div`
  ${(props) => lsdUtils.breakpoint(props.theme, 'xs', 'down')} {
    display: none;
  }
`

const Container = styled.header<{
  bordered?: boolean
}>`
  width: 100%;
  height: 60px;

  position: fixed;
  top: 0;
  left: 0;
  z-index: 101;

  background: rgb(var(--lsd-surface-primary));
  transition: top 0.2s;

  &.article_page,
  &.search_page {
  }
`

const Buttons = styled.div<{ mobile?: boolean }>`
  display: none;
  align-items: center;
  justify-content: center;

  .navbar-right-links {
    margin-right: var(--lsd-spacing-24);
  }

  > * {
    background: rgb(var(--lsd-surface-primary));

    :last-of-type {
      margin-left: -1px;
    }
  }

  .lsd-button {
    height: 28px;
    margin-right: var(--lsd-spacing-16);
  }

  ${(props) => lsdUtils.breakpoint(props.theme, 'xs', 'exact')} {
    ${(props) => props.mobile && `display: flex;`}
  }

  ${(props) => lsdUtils.breakpoint(props.theme, 'sm', 'up')} {
    ${(props) => !props.mobile && `display: flex;`}
  }
`
const NavBarContainer = styled.nav<{
  bordered?: boolean
}>`
  display: flex;
  padding: 16px 0;
  align-items: center;
  justify-content: space-between;
  position: relative;
  height: 100%;

  margin: auto;

  top: 0;
  width: calc(100% - 32px);
  max-width: ${uiConfigs.maxContainerWidth}px;
  box-sizing: border-box;

  > * {
    align-items: center;
    flex: 0 1 auto;
  }

  style {
    display: none !important;
  }
`

const NavLinksContainer = styled.div`
  display: flex;
  gap: 0 var(--lsd-spacing-32);
  align-items: center;

  ${(props) => lsdUtils.breakpoint(props.theme, 'xs', 'down')} {
    display: none !important;
  }
`

const Centered = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
`

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  text-decoration: none;
  gap: 0 var(--lsd-spacing-8);
`

const ControlsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;

  .theme-switch {
    display: block;
  }

  .menu-button {
    display: none;
  }

  ${(props) => lsdUtils.breakpoint(props.theme, 'xs', 'down')} {
    .theme-switch {
      // hide theme switch
      display: none;
    }

    .menu-button {
      display: block;
    }
  }
`
