import { LsdIcon } from '@acid-info/lsd-react'

export const FullscreenIcon = LsdIcon(
  (props) => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g clip-path="url(#clip0_2418_8608)">
        <path
          d="M4 18C4 19.1 4.9 20 6 20H10V18H6V14H4V18ZM20 6C20 4.9 19.1 4 18 4H14V6H18V10H20V6ZM6 6H10V4H6C4.9 4 4 4.9 4 6V10H6V6ZM20 18V14H18V18H14V20H18C19.1 20 20 19.1 20 18Z"
          fill={props.fill || 'white'}
        />
      </g>
      <defs>
        <clipPath id="clip0_2418_8608">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  ),
  { filled: true },
)
