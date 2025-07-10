import { uiConfigs } from '@/configs/ui.configs'
import { lsdUtils } from '@/utils/lsd.utils'
import { useIsMobile, useOnWindowResize } from '@/utils/ui.utils'
import { IconButton } from '@acid-info/lsd-react'
import styled from '@emotion/styled'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import QuickPinchZoom, { make3dTransformValue } from 'react-quick-pinch-zoom'
import { useKey, useWindowScroll } from 'react-use'
import { ExitFullscreenIcon } from '../Icons/ExitFullscreenIcon'
import { FullscreenIcon } from '../Icons/FullscreenIcon'

type ExpandedTransformValues = {
  scale: number
  translateX: number
  translateY: number
  windowCenterX: number
  windowCenterY: number
  originalWidth: number
  originalHeight: number
}

const DEFAULT_TRANSFORM_VALUES: ExpandedTransformValues = {
  scale: 1,
  translateX: 0,
  translateY: 0,
  windowCenterX: 0,
  windowCenterY: 0,
  originalWidth: 0,
  originalHeight: 0,
}

// Places the caption below the media.
const getCaptionPositionStyles = (
  captionElement: HTMLElement | null,
  expandedTransformValues: ExpandedTransformValues,
): React.CSSProperties => {
  if (!captionElement) return {}

  const { scale, originalWidth, originalHeight, windowCenterX, windowCenterY } =
    expandedTransformValues

  // Calculate the caption position - it should be below the media.
  // Here, we assume the media is centered in the window. So, the expanded bottom position is:
  const expandedBottom = windowCenterY + (originalHeight * scale) / 2
  const expandedLeft = windowCenterX - (originalWidth * scale) / 2

  return {
    position: 'fixed',
    top: expandedBottom,
    left: expandedLeft,
    width: originalWidth * scale,
  }
}

const calculateExpandedTransformValues = (
  element: HTMLElement | null,
  isMobile: boolean,
): ExpandedTransformValues => {
  if (!element) return DEFAULT_TRANSFORM_VALUES

  const vw = document.body.clientWidth
  const vh = window.innerHeight

  const maxWidth = isMobile ? vw - 32 : vw * 0.9375
  const maxHeight = vh - 160

  const rect = element.getBoundingClientRect()

  const scale = Math.min(maxHeight / rect.height, maxWidth / rect.width)

  const center = [rect.left + rect.width / 2, rect.top + rect.height / 2]
  const windowCenter = [vw / 2, vh / 2]

  const translate = windowCenter.map((w, i) => (w - center[i]!) / scale)

  return {
    scale,
    translateX: translate[0],
    translateY: translate[1],
    originalWidth: rect.width,
    originalHeight: rect.height,
    windowCenterX: windowCenter[0],
    windowCenterY: windowCenter[1],
  }
}

type UseLightBoxReturnType = {
  expandedCSS: React.CSSProperties
  expandedTransformValues: ExpandedTransformValues
  close: () => void
  display: (element: HTMLElement) => void
  isDisplayedElement: (el: HTMLElement) => boolean
  isActive: boolean
  isMobile: boolean
}

// Main logic was taken from:
// https://github.com/acid-info/logos-docusaurus-plugins/blob/964bf92263cf6eb61527c92c83c73ab6ba74e36d/packages/logos-docusaurus-theme/src/client/containers/LightBox/LightBox.tsx
export const useLightBox = (): UseLightBoxReturnType => {
  const { y: scrollY } = useWindowScroll()
  const [displayedElement, setDisplayedElement] = useState<HTMLElement | null>(
    null,
  )
  const isMobile = useIsMobile()
  const [expandedTransformValues, setExpandedTransformValues] =
    useState<ExpandedTransformValues>(DEFAULT_TRANSFORM_VALUES)
  const { scale, translateX, translateY } = expandedTransformValues
  const isActive = !!displayedElement

  const display = (element: HTMLElement) => {
    setDisplayedElement(element)

    const transformValues = calculateExpandedTransformValues(element, isMobile)

    setExpandedTransformValues(transformValues)
  }

  const close = useCallback(() => {
    setDisplayedElement(null)
  }, [])

  // When the window is resized, close the lightbox.
  useOnWindowResize(close)

  // When esc key is pressed, close the lightbox.
  useKey('Escape', close)

  // If the user scrolls, close the lightbox.
  useEffect(() => {
    // On mobile, this is not needed: even if the user attempts to scroll, lightbox stays open.
    if (isMobile) return

    if (displayedElement) close()
  }, [scrollY])

  // Only for mobile - hide the whole page's overflow when the lightbox is displayed.
  useEffect(() => {
    const html = document.querySelector('html')!
    html.style.overflow = isMobile && displayedElement ? 'hidden' : 'initial'
  }, [isMobile, displayedElement])

  const expandedCSS: React.CSSProperties = isActive
    ? {
        zIndex: 203,
        transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)`,
      }
    : {}

  return {
    expandedCSS,
    expandedTransformValues,
    close,
    display,
    isDisplayedElement: (el: HTMLElement) => displayedElement === el,
    isActive,
    isMobile,
  }
}

type OnUpdateParams = {
  x: number
  y: number
  scale: number
}

type LightBoxProps = {
  children: React.ReactNode
  caption: string
}

export const LightBox = ({ children, caption }: LightBoxProps) => {
  const {
    expandedCSS,
    expandedTransformValues,
    display,
    isDisplayedElement,
    isActive,
    close,
    isMobile,
  } = useLightBox()
  const ref = useRef<HTMLDivElement>(null)
  const pinchZoomChildRef = useRef<HTMLDivElement>(null)
  const captionRef = useRef<HTMLElement>(null)

  const handleUpdate = useCallback(({ x, y, scale }: OnUpdateParams) => {
    const img = pinchZoomChildRef.current
    if (img) {
      const transformValue = make3dTransformValue({ x, y, scale })
      img.style.transform = transformValue
    }
  }, [])

  const lightBoxContent =
    isMobile && ref.current && isDisplayedElement(ref.current) ? (
      <QuickPinchZoom
        onUpdate={handleUpdate}
        doubleTapZoomOutOnMaxScale
        maxZoom={3}
      >
        <div ref={pinchZoomChildRef}>{children}</div>
      </QuickPinchZoom>
    ) : (
      <>
        {children}

        <FullscreenIconButton
          size="medium"
          className={isActive ? '' : 'fullscreen-button'}
          onClick={() => display(ref.current!)}
        >
          <FullscreenIcon color="primary" width="16" height="16" />
        </FullscreenIconButton>
      </>
    )

  return (
    <>
      {isActive && (
        // When the lighbox is active: show a backdrop, and a header with an ExitFullscreenIcon.
        <>
          <Backdrop />

          <Header>
            <ExitFullscreenIconButton size="small" onClick={() => close()}>
              <ExitFullscreenIcon color="primary" width="18" height="18" />
            </ExitFullscreenIconButton>
          </Header>
        </>
      )}

      <LightboxMediaContainer ref={ref} style={expandedCSS} isActive={isActive}>
        {lightBoxContent}
      </LightboxMediaContainer>

      <LightBoxCaption
        style={
          isActive
            ? getCaptionPositionStyles(ref.current, expandedTransformValues)
            : undefined
        }
        isActive={isActive}
        ref={captionRef}
        dangerouslySetInnerHTML={{ __html: caption }}
      ></LightBoxCaption>
    </>
  )
}

const LightBoxCaption = styled.figcaption<{ isActive?: boolean }>`
  padding-top: 8px;
  ${lsdUtils.typography('body3')}
  text-align: center;

  @keyframes fadeIn {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }

  ${(props) =>
    props.isActive &&
    `
    z-index: 202;

    // The following prevents very large captions from overflowing.
    height: 72px;
    overflow: auto;
    animation: fadeIn 0.4s forwards;  // Apply the fadeIn animation when active
    `}
`

const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgb(var(--lsd-surface-primary));
  z-index: 201;
  opacity: 1;
`

const FullscreenIconButton = styled(IconButton)`
  display: flex;
  transition: opacity 0.4s;
  position: absolute;
  bottom: 8px;
  right: 8px;
  background-color: rgb(var(--lsd-text-secondary));

  ${(props) => lsdUtils.breakpoint(props.theme, 'sm', 'up')} {
    // If we're not in mobile mode, hide the button. Only show it when hovering over the container.
    opacity: 0;
    pointer-events: none;
  }

  outline: none;
`

const ExitFullscreenIconButton = styled(IconButton)`
  margin-right: 16px;
`

const LightboxMediaContainer = styled.div<{ isActive?: boolean }>`
  position: relative;
  transition: all 0.3s ease-in-out;

  // Show the fullscreen button when users hover over the container.
  &:hover .fullscreen-button {
    opacity: 1;
    pointer-events: auto;
  }

  // The following allows for greater mobile pinch zoom.
  ${(props) => lsdUtils.breakpoint(props.theme, 'lg', 'down')} {
    & > div {
      overflow: visible !important;
    }
  }

  // When the lightbox is active and showing media - removes any filters from said media.
  ${(props) =>
    props.isActive &&
    `
  div {
    filter: none;
  }
`}
`

export const Header = styled.header`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  flex-shrink: 0;

  position: fixed;
  top: 0;
  left: 0;

  width: 100%;
  height: ${uiConfigs.navbarRenderedHeight - 1}px;

  z-index: 1000;

  background-color: rgb(var(--lsd-surface-primary));
  transition: top 0.2s;
`
