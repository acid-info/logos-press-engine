import { LsdIcon } from '@acid-info/lsd-react'

export const VolumeIcon = LsdIcon(
  (props) => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g clip-path="url(#clip0_2418_8612)">
        <path
          d="M3 9.00001V15H7L12 20V4.00001L7 9.00001H3ZM16.5 12C16.5 10.23 15.48 8.71001 14 7.97001V16.02C15.48 15.29 16.5 13.77 16.5 12ZM14 3.23001V5.29001C16.89 6.15001 19 8.83001 19 12C19 15.17 16.89 17.85 14 18.71V20.77C18.01 19.86 21 16.28 21 12C21 7.72001 18.01 4.14001 14 3.23001Z"
          fill={props.fill || 'white'}
        />
      </g>
      <defs>
        <clipPath id="clip0_2418_8612">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  ),
  { filled: true },
)
