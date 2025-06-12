import { FooterLink } from '@/components/Footer/Footer.Link'
import { FooterSection } from '@/components/Footer/Footer.Section'
import { FooterLinksItems } from '@/configs/data.configs'
import { Typography } from '@acid-info/lsd-react'
import styled from '@emotion/styled'
import { lsdUtils } from '../../utils/lsd.utils'

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
  margin-top: 96px;
  padding-top: 16px;
  padding-bottom: 18px;
  border-top: 1px solid rgb(var(--lsd-border-primary));

  display: flex;
  align-items: baseline;

  ${(props) => lsdUtils.breakpoint(props.theme, 'xs', 'down')} {
    flex-direction: column;
  }
`

const BUInfo = styled(FooterSection)`
  ${(props) => lsdUtils.breakpoint(props.theme, 'xs', 'down')} {
    margin-bottom: 76px;
  }
`

const BUs = styled(FooterSection)`
  display: flex;
  flex-direction: row;
  gap: 8px;

  ${(props) => lsdUtils.breakpoint(props.theme, 'xs', 'down')} {
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

  ${(props) => lsdUtils.breakpoint(props.theme, 'xs', 'down')} {
    grid-template-columns: repeat(1, 1fr);
    padding-bottom: 24px;
  }
`

const LinkGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 34px;
  gap: 4px;

  ${(props) => lsdUtils.breakpoint(props.theme, 'xs', 'down')} {
    margin-bottom: 24px;
  }
`
