import { Button } from '@acid-info/lsd-react'
import React from 'react'

type LoadMoreButtonProps = {
  onClick: () => void
  disabled: boolean
  loading: boolean
}

export const LoadMoreButton: React.FC<LoadMoreButtonProps> = ({
  onClick,
  disabled,
  loading,
}) => {
  return (
    <div className="load-more">
      <Button onClick={onClick} disabled={disabled}>
        {loading ? 'Loading...' : 'Show More'}
      </Button>
    </div>
  )
}
