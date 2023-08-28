import { Typography } from '@acid-info/lsd-react'
import styled from '@emotion/styled'
import { FooterLink } from '@/components/Footer/Footer.Link'
import { FooterSection } from '@/components/Footer/Footer.Section'
import { FooterLinksItems } from '@/configs/data.configs'

export const FooterBuPanel = () => {
  return (
    <BusinessUnits>
      <BUInfo>
        <Typography
          component="div"
          genericFontFamily="sans-serif"
          variant="body2"
        >
          Logos
        </Typography>
        <Typography
          component="div"
          genericFontFamily="sans-serif"
          variant="body2"
        >
          Business Units:
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
                  {title}:
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
  margin-top: 50px;
  padding-top: 16px;
  border-top: 1px solid rgb(var(--lsd-border-primary));

  display: flex;
  align-items: baseline;

  @media (max-width: 768px) {
    flex-direction: column;
    margin-top: 72px;
  }
`

const BUInfo = styled(FooterSection)`
  @media (max-width: 768px) {
    margin-bottom: 76px;
  }
`

const BUs = styled(FooterSection)`
  display: flex;
  flex-direction: row;
  gap: 8px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`

const Row = styled.div`
  display: flex;
  gap: 8px;
`

const BusinessUnitItemGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);

  .footer-link-group-0 {
    grid-area: 1 / 1 / 2 / 2;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm.width}px) {
    grid-template-columns: repeat(1, 1fr);
    padding-bottom: 24px;
  }
`

const LinkGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 34px;
  gap: 4px;

  @media (max-width: 768px) {
    margin-bottom: 24px;
  }
`
