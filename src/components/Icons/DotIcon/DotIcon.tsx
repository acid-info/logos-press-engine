import { LsdIcon } from '@acid-info/lsd-react'

export const DotIcon = LsdIcon(
  (props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="2"
      height="2"
      viewBox="0 0 2 2"
      fill="none"
      {...props}
    >
      <circle cx="1" cy="1" r="1" fill="black" />
    </svg>
  ),
  { filled: true },
)
