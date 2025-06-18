import { FooterCopyright } from '@/components/Footer/Footer.Copyright'
import { FooterLink } from '@/components/Footer/Footer.Link'
import { FooterSection } from '@/components/Footer/Footer.Section'
import { FooterLinksItems } from '@/configs/data.configs'
import styled from '@emotion/styled'

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
  display: flex;
  align-items: baseline;
  border-top: 1px solid rgb(var(--lsd-theme-primary));
  padding-top: 24px;
  flex-direction: column;
  gap: 40px;
  margin-bottom: -36px;
  margin-top: 24px;

  @media only screen and (min-width: 576px) {
    flex-direction: row;
    gap: unset;
    margin-bottom: unset;
  }

  @media only screen and (min-width: 1200px) {
    margin-top: unset;
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
  margin-bottom: 8px;
  padding-left: 0;
  padding-top: 4px;

  @media only screen and (min-width: 576px) {
    padding-left: 16px;
  }
`
