import { useEffect, useRef } from 'react'
import { LPE } from '../types/lpe.types'

const usePrevious = <T>(value: T): T | undefined => {
  const ref = useRef<T>()
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}

export const useAutoScrollToNewGridItem = (
  items: LPE.Post.Document[],
  gridRef: React.RefObject<HTMLDivElement>,
) => {
  const prevItemsLength = usePrevious(items.length)

  useEffect(() => {
    const grid = gridRef.current
    if (
      !grid ||
      prevItemsLength === undefined ||
      items.length <= prevItemsLength
    ) {
      return
    }

    const firstNewChild = grid.children[prevItemsLength] as HTMLElement
    if (!firstNewChild) {
      return
    }

    firstNewChild.scrollIntoView({
      behavior: 'smooth',
      inline: 'start',
      block: 'nearest',
    })
  }, [items, prevItemsLength, gridRef])
}
