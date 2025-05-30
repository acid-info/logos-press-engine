import { Typography } from '@acid-info/lsd-react'
import styled from '@emotion/styled'
import clsx from 'clsx'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { lsdUtils } from '../../utils/lsd.utils'
import { ArrowUpRightIcon } from '../Icons/ArrowUpRightIcon'

interface Props {
  links: {
    href: string
    label: string
    target?: string
    isExternal?: boolean
  }[]
}

export const NavbarLinks = ({ links }: Props) => {
  const router = useRouter()
  const { pathname } = router

  return (
    <Container>
      {links.map((link, idx) => (
        <Link
          key={idx}
          href={link.href}
          className={clsx(pathname === link.href && 'active')}
          target={link?.target || '_self'}
        >
          <LinkContent>
            <Typography variant="label1" component="span">
              {link.label}
            </Typography>
            {link.isExternal && <ArrowUpRightIcon />}
          </LinkContent>
        </Link>
      ))}
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0 var(--lsd-spacing-24);

  a {
    text-decoration: none;
  }

  a:hover,
  a:active,
  a:focus,
  a.active {
    text-decoration: underline;
  }

  ${(props) => lsdUtils.breakpoint(props.theme, 'xs', 'down')} {
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    padding-top: 0;
    padding-bottom: 16px;
    gap: 0;
    height: 100%;
  }
`

const LinkContent = styled.span`
  display: flex;
  align-items: center;
  gap: 5px;
`
