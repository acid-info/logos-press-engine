import { FooterBuPanel } from '@/components/Footer/Footer.BuPanel'
import { FooterCTAPanel } from '@/components/Footer/Footer.CTAPanel'
import { FooterOrgPanel } from '@/components/Footer/Footer.OrgPanel'
import { FooterSectionContainer } from '@/components/Footer/Footer.Section'
import { Button } from '@acid-info/lsd-react'
import styled from '@emotion/styled'

export default function Footer() {
  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
    <FooterSectionContainer>
      <FooterCTAPanel />
      <FooterOrgPanel />
      <FooterBuPanel />
      <ScrollToTop size="small" onClick={handleScrollToTop}>
        Back to top ↑
      </ScrollToTop>
    </FooterSectionContainer>
  )
}

const ScrollToTop = styled(Button)`
  width: fit-content;
  position: absolute;
  bottom: 34px;
  left: 0;

  span {
    font-size: 0.75rem;
    font-weight: var(--lsd-label2-fontWeight);
    line-height: 1.25rem;
  }

  @media only screen and (min-width: 576px) {
    left: 16px;

    span {
      line-height: 1.25rem;
    }
  }

  @media only screen and (min-width: 997px) {
    left: unset;

    span {
      line-height: var(--lsd-label2-lineHeight);
    }
  }
`
