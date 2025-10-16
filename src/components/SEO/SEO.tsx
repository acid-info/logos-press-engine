import Head from 'next/head'
import { siteConfigs } from '../../configs/site.configs'
import { LPE } from '../../types/lpe.types'
import { getOpenGraphImageUrl } from '../../utils/og.utils'
import { getWebsiteUrl } from '../../utils/route.utils'

type Metadata = {
  title?: string
  description?: string
  type?: string
  locale?: string
  site_name?: string
  pageURL?: string
  imageUrl?: string
  image?: LPE.Image.Document | null
  tags?: string[]
  pagePath?: string
  date?: string | null
  contentType?: LPE.PostType
  noIndex?: boolean
  rssFileName?: string
  authors?: string[]
}

const SITE_URL = getWebsiteUrl()

export default function SEO({
  title: _title,
  description: _description,
  type,
  locale,
  site_name,
  pageURL,
  imageUrl,
  image,
  tags = siteConfigs.keywords,
  pagePath = '',
  date,
  contentType,
  noIndex = false,
  rssFileName,
  authors,
}: Metadata) {
  const title =
    _title && _title.length
      ? `${_title} - ${siteConfigs.title}`
      : siteConfigs.title
  const description = _description || siteConfigs.description

  const ogImageUrl =
    imageUrl ||
    getOpenGraphImageUrl({
      title: _title,
      imageUrl: image?.url,
      contentType,
      date,
      pagePath,
      authors,
    })

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:locale" content={locale ?? 'en-US'} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type ?? 'website'} />
      <meta property="og:url" content={pageURL ?? `${SITE_URL}${pagePath}`} />
      <meta property="keywords" content={tags.join(', ')} />
      <meta property="og:site_name" content={site_name ?? siteConfigs.title} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta property="og:image" content={ogImageUrl} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={pageURL ?? `${SITE_URL}${pagePath}`} />
      <meta name="twitter:site" content={`@${siteConfigs.xHandle}`} />
      <meta property="twitter:image" content={ogImageUrl} />
      <link rel="canonical" href={`${SITE_URL}${pagePath}`} />
      <link
        rel="alternate"
        type="application/rss+xml"
        href={`${getWebsiteUrl()}/rss/main.xml`}
      />
      <link
        rel="alternate"
        type="application/rss+xml"
        href={`${getWebsiteUrl()}/rss/logos-state.xml`}
      />
      {noIndex && (
        <>
          <meta name="robots" content="noindex, nofollow" />
        </>
      )}
    </Head>
  )
}
