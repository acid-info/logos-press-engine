import { FooterCopyright } from '@/components/Footer/Footer.Copyright'
import { FooterLink } from '@/components/Footer/Footer.Link'
import { FooterSection } from '@/components/Footer/Footer.Section'
import { FooterLinksItems } from '@/configs/data.configs'
import styled from '@emotion/styled'
import { lsdUtils } from '../../utils/lsd.utils'

export const FooterOrgPanel = () => {
  return (
    <Wrapper>
      <FooterCopyright />
      <Links>
        {FooterLinksItems.about.map(({ key, links }, idx) => (
          <Group key={key}>
            {links.map(({ label, href }, idx) => (
              <FooterLink
                key={'first-group' + idx}
                component="a"
                href={href}
                genericFontFamily="sans-serif"
                variant="body2"
              >
                {label}
              </FooterLink>
            ))}
          </Group>
        ))}
      </Links>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  margin-top: 50px;
  display: flex;
  align-items: baseline;
  border-top: 1px solid rgb(var(--lsd-theme-primary));
  padding-top: 16px;

  ${(props) => lsdUtils.breakpoint(props.theme, 'xs', 'down')} {
    flex-direction: column;
    margin-top: 72px;
  }
`

const Group = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  flex-wrap: wrap;
`

const Links = styled(FooterSection)`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 36px;
`
