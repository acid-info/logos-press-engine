import { LPEFooterGroup } from '@/types/ui.types'
import { getPostLink } from '../utils/route.utils'

export const ArticleBlocksOrders = {
  title: 0,
  subtitle: 1,
  summary: 2,
  tags: 3,
  mentions: 4,
  cover: 5,
}

export const AuthorsConfig = {
  hiddenEmailAddresses: ['noshow@logos.co'],
}

export const NavLinksItems = [
  { label: 'Learn', href: '/search?type=article&topic=Learn' },
  { label: 'Community', href: '/search?type=article&topic=Community' },
  { label: 'Articles', href: '/search?type=article' },
  { label: 'Podcasts', href: getPostLink('podcast') },
  { label: 'Calendar', href: '/calendar' },
  { label: 'About', href: '/about' },
  {
    label: 'Logos',
    href: 'https://logos.co/',
    target: '_blank',
    isExternal: true,
    position: 'right',
  },
  {
    label: 'Discuss',
    href: 'https://forum.logos.co/',
    target: '_blank',
    isExternal: true,
    position: 'right',
  },
]

export const FooterLinksItems: {
  org: LPEFooterGroup[]
  about: LPEFooterGroup[]
} = {
  org: [
    // {
    //   title: 'Research',
    //   links: [{ label: 'VacP2P', href: 'https://vac.dev/' }],
    // },
    // {
    //   title: 'Infrastructure',
    //   links: [
    //     { label: 'Waku', href: 'https://waku.org/' },
    //     { label: 'Nimbus', href: 'https://nimbus.team/' },
    //     { label: 'Codex', href: 'https://codex.storage/' },
    //     { label: 'Nomos', href: 'https://nomos.tech/' },
    //   ],
    // },
  ],

  about: [
    {
      title: null,
      key: 'all',
      links: [
        {
          label: 'Github',
          href: 'https://github.com/logos-co',
          key: 'github',
        },
        {
          label: 'Work With Us',
          href: 'https://job-boards.greenhouse.io/logos',
          key: 'work-with-us',
        },
        {
          label: 'Terms & Conditions',
          href: 'https://logos.co/terms',
          key: 'terms-and-conditions',
        },
        {
          label: 'Privacy Policy',
          href: 'https://logos.co/privacy-policy',
          key: 'privacy-policy',
        },
        {
          label: 'Security',
          href: 'https://logos.co/security',
          key: 'security',
        },
      ],
    },
  ],
}
