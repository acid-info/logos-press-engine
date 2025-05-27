import { siteConfigs } from '@/configs/site.configs'
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
  { label: 'Articles', href: '/search?type=article' },
  { label: 'Learn', href: '/search?type=article&topic=Learn' },
  { label: 'Podcasts', href: getPostLink('podcast') },
  { label: 'About', href: '/about' },
]

export const FooterLinksItems: {
  org: LPEFooterGroup[]
  about: LPEFooterGroup[]
} = {
  org: [
    {
      title: 'Research',
      links: [
        { label: 'VacP2P', href: 'https://vac.dev/' },
        { label: 'AFAIK', href: 'https://afaik.institute/' },
      ],
    },
    {
      title: 'Infrastructure',
      links: [
        { label: 'Waku', href: 'https://waku.org/' },
        { label: 'Nimbus', href: 'https://nimbus.team/' },
        { label: 'Codex', href: 'https://codex.storage/' },
        { label: 'Nomos', href: 'https://nomos.tech/' },
      ],
    },
    {
      title: 'Creative Studio',
      links: [{ label: 'Acid.info', href: 'https://acid.info/' }],
    },
    {
      title: 'Movement',
      links: [{ label: 'Logos', href: 'https://logos.co/' }],
    },
    {
      title: 'User-facing Products',
      links: [
        { label: 'Status', href: 'https://status.im/' },
        { label: 'Keycard', href: 'https://keycard.tech/' },
      ],
    },
  ],

  about: [
    {
      title: null,
      key: 'social',
      links: [
        {
          label: 'Discord',
          href: 'https://discord.gg/logosnetwork',
          key: 'discord',
        },
        { label: 'X', href: `https://x.com/${siteConfigs.xHandle}`, key: 'x' },
        {
          label: 'Github',
          href: `https://github.com/${siteConfigs.githubHandle}`,
          key: 'github',
        },
        {
          label: 'Youtube',
          href: `https://www.youtube.com/${siteConfigs.youtubeHandle}`,
          key: 'youtube',
        },
        {
          label: 'RSS',
          href: `https://press.logos.co/rss/main.xml`,
          key: 'rss',
        },
      ],
    },
    {
      title: null,
      key: 'info',
      links: [
        { label: 'Terms of Use', href: '/terms' },
        { label: 'Privacy Policy', href: '/privacy-policy' },
        { label: 'Security', href: '/security' },
        { label: 'About', href: '/about' },
      ],
    },
  ],
}
