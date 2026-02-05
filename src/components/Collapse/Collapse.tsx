import {
  ChevronDownIcon,
  ChevronUpIcon,
  Typography,
} from '@acid-info/lsd-react'
import styled from '@emotion/styled'
import clsx from 'clsx'
import { useState } from 'react'

type Props = React.HTMLAttributes<HTMLDivElement> & {
  label: string
  children: React.ReactNode
  onClick?: () => void
  initOpen?: boolean
}

export default function Collapse({
  label,
  children,
  className,
  onClick,
  initOpen = true,
  ...props
}: Props) {
  const [open, setOpen] = useState(initOpen)

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation()
    setOpen((prev) => !prev)
    onClick && onClick()
  }

  return (
    <div {...props} className={clsx(className)}>
      <Header onClick={(e) => handleClick(e)}>
        <Label color="primary" component="label" variant="label1">
          {label}
        </Label>
        <Icon>
          {open ? (
            <ChevronUpIcon color="primary" />
          ) : (
            <ChevronDownIcon color="primary" />
          )}
        </Icon>
      </Header>
      {open && <Content>{children}</Content>}
    </div>
  )
}

const Header = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  text-align: center;

  cursor: pointer;
  background: none;
  border: 1px solid rgb(var(--lsd-border-primary));

  height: 40px;
  padding: 9px 17px;
  box-sizing: border-box;

  &:focus {
    outline: none;
  }
`

const Label = styled(Typography)`
  cursor: pointer;
  margin: auto;
`

const Icon = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
`

const Content = styled.div`
  border: 1px solid rgb(var(--lsd-border-primary));
  border-top: none;
  display: flex;
  flex-direction: column;
`
