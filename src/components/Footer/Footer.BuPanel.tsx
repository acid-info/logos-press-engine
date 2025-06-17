import { FooterLink } from '@/components/Footer/Footer.Link'
import { FooterSection } from '@/components/Footer/Footer.Section'
import { FooterLinksItems } from '@/configs/data.configs'
import { Typography } from '@acid-info/lsd-react'
import styled from '@emotion/styled'

export const FooterBuPanel = () => {
  return (
    <BusinessUnits>
      <BUInfo>
        <Typography
          component="div"
          genericFontFamily="sans-serif"
          variant="body2"
        >
          Built by{' '}
          <a href="https://free.technology/" target="_blank">
            IFT
          </a>
        </Typography>
      </BUInfo>
      <BUs>
        <BusinessUnitItemGroup>
          {FooterLinksItems.org.map(({ key, title, links }, idx) => (
            <LinkGroup
              key={`${key || title}-${idx}`}
              className={`footer-link-group-${idx}`}
            >
              <div>
                <Typography
                  component="div"
                  genericFontFamily="sans-serif"
                  variant="body2"
                >
                  {title}
                </Typography>
              </div>
              <Row>
                {links.map(({ label, href }, idx) => (
                  <FooterLink
                    key={'second-group-link' + idx}
                    component="a"
                    href={href}
                    genericFontFamily="sans-serif"
                    variant="body2"
                  >
                    {label}
                  </FooterLink>
                ))}
              </Row>
            </LinkGroup>
          ))}
        </BusinessUnitItemGroup>
      </BUs>
    </BusinessUnits>
  )
}

const BusinessUnits = styled.div`
  padding-top: 24px;
  padding-bottom: 18px;
  border-top: 1px solid rgb(var(--lsd-border-primary));
  display: flex;
  align-items: baseline;
  flex-direction: column;
  gap: 40px;
  margin-bottom: 116px;

  @media only screen and (min-width: 576px) {
    flex-direction: row;
    gap: unset;
    margin-bottom: 86px;
  }

  @media only screen and (min-width: 997px) {
    margin-bottom: unset;
  }

  @media only screen and (min-width: 1200px) {
    padding-bottom: 34px;
  }
`

const BUInfo = styled(FooterSection)``

const BUs = styled(FooterSection)`
  display: flex;
  flex-direction: column;
  padding-left: 0;
  gap: 8px;

  @media only screen and (min-width: 576px) {
    flex-direction: row;
    padding-left: 16px;
  }
`

const Row = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`

const BusinessUnitItemGroup = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2rem;

  > * {
    flex: 1;
  }

  @media only screen and (min-width: 576px) {
    flex-direction: row;
    gap: 1rem;
  }
`

const LinkGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 4px;
  gap: 4px;

  @media only screen and (min-width: 576px) {
    margin-bottom: 34px;
  }
`
