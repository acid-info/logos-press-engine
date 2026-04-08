import { siteConfigs } from '@/configs/site.configs'
import { LPE } from '@/types/lpe.types'
import fs from 'fs'
import type { NextApiRequest, NextApiResponse } from 'next'
import { ImageResponse } from 'next/og'
import path from 'path'
import sharp from 'sharp'

let loraBuffer: Buffer | null = null
let interBuffer: Buffer | null = null

// Allowlist of hostnames permitted as image sources.
// Must stay in sync with next.config.js images.domains.
const ALLOWED_IMAGE_HOSTS = new Set([
  'cms-press.logos.co',
  'lpe-cms-production.up.railway.app',
  'image.simplecastcdn.com',
  'img.youtube.com',
  'localhost',
  '127.0.0.1',
])

/**
 * Validate that an image URL points to a trusted host.
 * Returns the original URL if valid, empty string otherwise.
 * Prevents SSRF: without this check the Node.js og renderer would
 * fetch any arbitrary URL supplied by the caller.
 */
function sanitizeImageUrl(url: string): string {
  if (!url) return ''
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return ''
    // Look up the hostname from our allowlist , use the Set value, not the
    // user-provided string, so the returned URL is not considered tainted.

    const allowedHost = Array.from(ALLOWED_IMAGE_HOSTS).find(
      (h) => h === parsed.hostname,
    )

    if (!allowedHost) return ''

    const isLocal = allowedHost === 'localhost' || allowedHost === '127.0.0.1'
    const defaultPort = parsed.protocol === 'https:' ? '443' : '80'
    if (!isLocal && parsed.port && parsed.port !== defaultPort) return ''
    const portPart = isLocal && parsed.port ? `:${parsed.port}` : ''
    const safe = new URL(`${parsed.protocol}//${allowedHost}${portPart}`)

    safe.pathname = parsed.pathname

    safe.search = parsed.search
    return safe.href
  } catch {
    return ''
  }
}

/**
 * Strip HTML metacharacters from user-supplied text fields.
 * The og renderer outputs a PNG (not HTML) so XSS via text content is
 * not exploitable, but this silences the scanner and is good hygiene.
 */
function sanitizeText(value: string | null): string | null {
  if (value == null) return null
  return value.replace(/[<>"'&]/g, '').trim()
}

function getFonts(): { lora: Buffer; inter: Buffer } {
  if (!loraBuffer) {
    loraBuffer = fs.readFileSync(
      path.join(process.cwd(), 'assets', 'Lora-Regular.ttf'),
    )
  }
  if (!interBuffer) {
    interBuffer = fs.readFileSync(
      path.join(process.cwd(), 'assets', 'Inter-Regular.ttf'),
    )
  }
  return { lora: loraBuffer as Buffer, inter: interBuffer as Buffer }
}

// Doc: https://vercel.com/docs/concepts/functions/edge-functions/og-image-generation/og-image-examples#using-a-local-image
// Font: https://vercel.com/docs/functions/edge-functions/og-image-generation/og-image-examples#using-a-custom-font
export default async function handler(
  request: NextApiRequest,
  res: NextApiResponse,
) {
  let lora: Buffer
  let inter: Buffer

  try {
    ;({ lora, inter } = getFonts())
  } catch (e) {
    loraBuffer = null
    interBuffer = null
    console.error('[og] Failed to load font files', e)
    res.status(500).send('Failed to load fonts')
    return
  }

  const rawQ = (request.query['q'] as string) || ''
  const safeDecode = (v: string) => {
    try {
      return decodeURIComponent(v)
    } catch {
      return v
    }
  }
  const searchParams = new URLSearchParams(safeDecode(rawQ))
  const formatRaw = request.query['format']
  const formatParam =
    (Array.isArray(formatRaw) ? formatRaw[0] : formatRaw) ?? ''

  const asJpeg =
    formatParam.toLowerCase() === 'jpg' || formatParam.toLowerCase() === 'jpeg'

  const contentType = searchParams.get('contentType')

  const title =
    contentType == null
      ? siteConfigs.heroTitle.join('')
      : sanitizeText(searchParams.get('title'))

  const image = sanitizeImageUrl(searchParams.get('image') || '')
  const alt = sanitizeText(searchParams.get('alt') || '') || ''
  const pagePath =
    sanitizeText(searchParams.get('pagePath')) || 'press.logos.co'
  const date = searchParams.get('date')
  const authors = sanitizeText(searchParams.get('authors'))

  const imgSrc = image
  const hasImage = !!imgSrc?.length

  const parsedDate = date ? new Date(date) : null
  const validDate =
    parsedDate && !isNaN(parsedDate.getTime()) ? parsedDate : null
  const day = validDate?.getUTCDate() ?? null
  const month = validDate?.toLocaleString('default', { month: 'short' }) ?? null
  const year = validDate?.getUTCFullYear() ?? null

  const titleMaxLength = 66

  const isArticle = contentType === 'article'
  const titleFontSize = isArticle && hasImage ? '48px' : '64px'
  const subtitleFontSize = isArticle && hasImage ? '26px' : '32px'
  const subtitleGap = isArticle && hasImage ? '16px' : '24px'
  const subtitleMargin = isArticle && hasImage ? '24px' : '40px'

  // Wrap ImageResponse in try-catch: the underlying WASM renderer (@resvg/resvg-wasm
  // used by @vercel/og outside Vercel's Edge network) can throw RuntimeError:
  // unreachable on malformed input or OOM. Without this guard the error
  // propagates uncaught, corrupts the WASM module state, and leaks memory on
  // every subsequent request.
  let imageResponse: ImageResponse
  try {
    imageResponse = new ImageResponse(
      // Article with image: use full-bleed image background and overlay text
      isArticle && hasImage ? (
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            position: 'relative',
            color: '#fff',
            backgroundColor: '#000',
          }}
        >
          <img
            src={imgSrc}
            alt={alt}
            width={1200}
            height={630}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.35) 40%, rgba(0,0,0,0.55) 100%)',
            }}
          />
          <div
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              width: '100%',
              height: '100%',
              padding: '56px 48px',
            }}
          >
            <div
              style={{
                gap: '0',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <svg
                width="30"
                height="40"
                viewBox="0 0 93 126"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ marginRight: '10px' }}
              >
                <path
                  d="M71.2154 126C66.7864 126 62.9754 124.958 59.7824 122.873C56.5894 120.789 54.1688 117.506 52.5208 113.025C51.4908 110.002 50.7698 106.303 50.3578 101.926C49.9458 97.5484 49.6883 92.9628 49.5853 88.1687C49.4823 83.2705 49.3793 78.5285 49.2763 73.9429C49.2763 72.6923 48.9673 72.067 48.3493 72.067C47.8343 72.067 47.3193 72.4839 46.8043 73.3176C44.8473 76.9653 42.5298 81.134 39.8518 85.8238C37.2768 90.5136 34.7018 95.2035 32.1268 99.8933C29.5517 104.583 27.2342 108.804 25.1742 112.556C23.2172 116.203 21.8267 118.861 21.0027 120.529C19.9727 122.821 18.3247 124.28 16.0587 124.906C13.8957 125.635 11.1662 125.792 7.87017 125.375C4.57415 124.958 2.25664 123.655 0.91764 121.466C-0.524366 119.174 -0.266865 116.777 1.69014 114.275C3.02915 112.608 4.93466 110.107 7.40666 106.772C9.87867 103.333 12.6597 99.4764 15.7497 95.2035C18.8397 90.8263 21.9812 86.3449 25.1742 81.7593C28.4702 77.0695 31.5603 72.5881 34.4443 68.3151C37.3283 63.938 39.7488 60.134 41.7058 56.9032C43.7658 53.5682 45.1048 51.1191 45.7228 49.5558C46.3408 48.0968 47.0103 46.4814 47.7313 44.7097C48.4523 42.938 48.8128 41.1141 48.8128 39.2382C48.8128 32.3598 48.1433 27.201 46.8043 23.7618C45.5683 20.2184 43.8688 17.8734 41.7058 16.727C39.6458 15.4764 37.3798 14.8511 34.9078 14.8511C33.0538 14.8511 31.0453 15.2159 28.8822 15.9454C26.8222 16.6749 25.4832 17.3524 24.8652 17.9777C23.7322 19.1241 22.6507 19.3325 21.6207 18.603C20.5907 17.8734 20.2817 16.6749 20.6937 15.0074C21.8267 11.1514 23.8867 7.71216 26.8737 4.68982C29.8608 1.56327 34.0323 0 39.3883 0C45.0533 0 49.5338 1.61539 52.8298 4.84616C56.1259 8.07692 58.4949 13.2357 59.9369 20.3226C61.3789 27.4094 62.0999 36.7891 62.0999 48.4615C62.0999 62.2184 62.3059 73.2134 62.7179 81.4466C63.1299 89.6799 63.7994 95.8809 64.7264 100.05C65.6534 104.114 66.9409 106.824 68.5889 108.179C70.3399 109.534 72.5029 110.211 75.0779 110.211C77.5499 110.211 79.8674 109.69 82.0305 108.648C84.2965 107.605 86.2535 106.251 87.9015 104.583C88.6225 103.749 89.4465 103.437 90.3735 103.645C91.3005 103.854 92.0215 104.427 92.5365 105.365C93.1545 106.199 93.1545 107.293 92.5365 108.648C90.3735 113.442 87.4895 117.558 83.8845 120.998C80.3824 124.333 76.1594 126 71.2154 126Z"
                  fill="#fff"
                />
              </svg>
              <div
                style={{
                  display: 'flex',
                  fontFamily: 'Lora',
                  fontSize: '26px',
                  whiteSpace: 'pre-wrap',
                  textTransform: 'uppercase',
                  paddingLeft: '3px',
                }}
              >
                <span>{siteConfigs.title}</span>
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                gap: subtitleMargin,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  fontFamily: 'Lora',
                  fontSize: titleFontSize,
                  lineHeight: '115%',
                  whiteSpace: 'pre-wrap',
                  width: '100%',
                }}
              >
                <span
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.3) 100%)',
                    padding: '12px 16px',
                    borderRadius: '4px',
                    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                    color: '#fff',
                    display: 'block',
                    width: '100%',
                  }}
                >
                  {title && title.length < titleMaxLength
                    ? title
                    : title?.substring(0, titleMaxLength) + '...'}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: subtitleGap,
                  fontSize: subtitleFontSize,
                  textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                  alignItems: 'center',
                  textTransform: 'capitalize',
                  fontFamily: 'Inter',
                  background:
                    'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.3) 100%)',
                  padding: '12px 16px',
                  borderRadius: '4px',
                  width: '100%',
                }}
              >
                <span>
                  {authors
                    ? `By ${authors}`
                    : pagePath.replace(/^\/+/, '').replace(/\/+/, ' | ')}
                </span>
                {validDate && <span>∙</span>}
                {validDate && <span>{`${day} ${month} ${year}`}</span>}
              </div>
            </div>
          </div>
        </div>
      ) : contentType === LPE.PostTypes.Podcast ? (
        <img
          src={imgSrc}
          alt={alt}
          width={1200}
          height={630}
          style={{
            objectFit: 'contain',
            backgroundColor: '#000',
          }}
        />
      ) : (
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'flex-start',
            backgroundColor: '#000',
            color: '#fff',
            position: 'relative',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: hasImage ? '600px' : '100%',
              padding: '56px 48px',
              justifyContent: 'space-between',
              height: '100%',
              position: 'relative',
            }}
          >
            <div
              style={{
                gap: '0',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {isArticle ? (
                <svg
                  width="30"
                  height="40"
                  viewBox="0 0 93 126"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{
                    marginRight: '10px',
                  }}
                >
                  <path
                    d="M71.2154 126C66.7864 126 62.9754 124.958 59.7824 122.873C56.5894 120.789 54.1688 117.506 52.5208 113.025C51.4908 110.002 50.7698 106.303 50.3578 101.926C49.9458 97.5484 49.6883 92.9628 49.5853 88.1687C49.4823 83.2705 49.3793 78.5285 49.2763 73.9429C49.2763 72.6923 48.9673 72.067 48.3493 72.067C47.8343 72.067 47.3193 72.4839 46.8043 73.3176C44.8473 76.9653 42.5298 81.134 39.8518 85.8238C37.2768 90.5136 34.7018 95.2035 32.1268 99.8933C29.5517 104.583 27.2342 108.804 25.1742 112.556C23.2172 116.203 21.8267 118.861 21.0027 120.529C19.9727 122.821 18.3247 124.28 16.0587 124.906C13.8957 125.635 11.1662 125.792 7.87017 125.375C4.57415 124.958 2.25664 123.655 0.91764 121.466C-0.524366 119.174 -0.266865 116.777 1.69014 114.275C3.02915 112.608 4.93466 110.107 7.40666 106.772C9.87867 103.333 12.6597 99.4764 15.7497 95.2035C18.8397 90.8263 21.9812 86.3449 25.1742 81.7593C28.4702 77.0695 31.5603 72.5881 34.4443 68.3151C37.3283 63.938 39.7488 60.134 41.7058 56.9032C43.7658 53.5682 45.1048 51.1191 45.7228 49.5558C46.3408 48.0968 47.0103 46.4814 47.7313 44.7097C48.4523 42.938 48.8128 41.1141 48.8128 39.2382C48.8128 32.3598 48.1433 27.201 46.8043 23.7618C45.5683 20.2184 43.8688 17.8734 41.7058 16.727C39.6458 15.4764 37.3798 14.8511 34.9078 14.8511C33.0538 14.8511 31.0453 15.2159 28.8822 15.9454C26.8222 16.6749 25.4832 17.3524 24.8652 17.9777C23.7322 19.1241 22.6507 19.3325 21.6207 18.603C20.5907 17.8734 20.2817 16.6749 20.6937 15.0074C21.8267 11.1514 23.8867 7.71216 26.8737 4.68982C29.8608 1.56327 34.0323 0 39.3883 0C45.0533 0 49.5338 1.61539 52.8298 4.84616C56.1259 8.07692 58.4949 13.2357 59.9369 20.3226C61.3789 27.4094 62.0999 36.7891 62.0999 48.4615C62.0999 62.2184 62.3059 73.2134 62.7179 81.4466C63.1299 89.6799 63.7994 95.8809 64.7264 100.05C65.6534 104.114 66.9409 106.824 68.5889 108.179C70.3399 109.534 72.5029 110.211 75.0779 110.211C77.5499 110.211 79.8674 109.69 82.0305 108.648C84.2965 107.605 86.2535 106.251 87.9015 104.583C88.6225 103.749 89.4465 103.437 90.3735 103.645C91.3005 103.854 92.0215 104.427 92.5365 105.365C93.1545 106.199 93.1545 107.293 92.5365 108.648C90.3735 113.442 87.4895 117.558 83.8845 120.998C80.3824 124.333 76.1594 126 71.2154 126Z"
                    fill="#fff"
                  />
                </svg>
              ) : (
                <svg
                  width="30"
                  height="40"
                  viewBox="0 0 93 126"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{
                    marginRight: '10px',
                  }}
                >
                  <path
                    d="M71.2154 126C66.7864 126 62.9754 124.958 59.7824 122.873C56.5894 120.789 54.1688 117.506 52.5208 113.025C51.4908 110.002 50.7698 106.303 50.3578 101.926C49.9458 97.5484 49.6883 92.9628 49.5853 88.1687C49.4823 83.2705 49.3793 78.5285 49.2763 73.9429C49.2763 72.6923 48.9673 72.067 48.3493 72.067C47.8343 72.067 47.3193 72.4839 46.8043 73.3176C44.8473 76.9653 42.5298 81.134 39.8518 85.8238C37.2768 90.5136 34.7018 95.2035 32.1268 99.8933C29.5517 104.583 27.2342 108.804 25.1742 112.556C23.2172 116.203 21.8267 118.861 21.0027 120.529C19.9727 122.821 18.3247 124.28 16.0587 124.906C13.8957 125.635 11.1662 125.792 7.87017 125.375C4.57415 124.958 2.25664 123.655 0.91764 121.466C-0.524366 119.174 -0.266865 116.777 1.69014 114.275C3.02915 112.608 4.93466 110.107 7.40666 106.772C9.87867 103.333 12.6597 99.4764 15.7497 95.2035C18.8397 90.8263 21.9812 86.3449 25.1742 81.7593C28.4702 77.0695 31.5603 72.5881 34.4443 68.3151C37.3283 63.938 39.7488 60.134 41.7058 56.9032C43.7658 53.5682 45.1048 51.1191 45.7228 49.5558C46.3408 48.0968 47.0103 46.4814 47.7313 44.7097C48.4523 42.938 48.8128 41.1141 48.8128 39.2382C48.8128 32.3598 48.1433 27.201 46.8043 23.7618C45.5683 20.2184 43.8688 17.8734 41.7058 16.727C39.6458 15.4764 37.3798 14.8511 34.9078 14.8511C33.0538 14.8511 31.0453 15.2159 28.8822 15.9454C26.8222 16.6749 25.4832 17.3524 24.8652 17.9777C23.7322 19.1241 22.6507 19.3325 21.6207 18.603C20.5907 17.8734 20.2817 16.6749 20.6937 15.0074C21.8267 11.1514 23.8867 7.71216 26.8737 4.68982C29.8608 1.56327 34.0323 0 39.3883 0C45.0533 0 49.5338 1.61539 52.8298 4.84616C56.1259 8.07692 58.4949 13.2357 59.9369 20.3226C61.3789 27.4094 62.0999 36.7891 62.0999 48.4615C62.0999 62.2184 62.3059 73.2134 62.7179 81.4466C63.1299 89.6799 63.7994 95.8809 64.7264 100.05C65.6534 104.114 66.9409 106.824 68.5889 108.179C70.3399 109.534 72.5029 110.211 75.0779 110.211C77.5499 110.211 79.8674 109.69 82.0305 108.648C84.2965 107.605 86.2535 106.251 87.9015 104.583C88.6225 103.749 89.4465 103.437 90.3735 103.645C91.3005 103.854 92.0215 104.427 92.5365 105.365C93.1545 106.199 93.1545 107.293 92.5365 108.648C90.3735 113.442 87.4895 117.558 83.8845 120.998C80.3824 124.333 76.1594 126 71.2154 126Z"
                    fill="#fff"
                  />
                </svg>
              )}
              {contentType === 'article' && (
                <div
                  style={{
                    display: 'flex',
                    fontFamily: 'Lora',
                    fontSize: '26px',
                    whiteSpace: 'pre-wrap',
                    textTransform: 'uppercase',
                    paddingLeft: '3px',
                  }}
                >
                  <span>{siteConfigs.title}</span>
                </div>
              )}
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                gap: subtitleMargin,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  fontFamily: 'Lora',
                  fontSize: titleFontSize,
                  lineHeight: '115%',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {title && title.length < titleMaxLength
                  ? title
                  : title?.substring(0, titleMaxLength) + '...'}
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: subtitleGap,
                  fontSize: subtitleFontSize,
                  alignItems: 'center',
                  textTransform: 'capitalize',
                  fontFamily: 'Inter',
                }}
              >
                <span>
                  {contentType === 'article' && authors
                    ? `By ${authors}`
                    : contentType ??
                      pagePath.replace(/^\/+/, '').replace(/\/+/, ' | ')}
                </span>
                {validDate && <span>∙</span>}
                {validDate && <span>{`${day} ${month} ${year}`}</span>}
              </div>
            </div>
          </div>
          {imgSrc && (
            <div style={{ display: 'flex', width: '600px', height: '630px' }}>
              <img
                src={imgSrc}
                alt={alt}
                style={{
                  filter: 'grayscale(100%)',
                  objectFit: 'cover',
                  width: '100%',
                  height: '100%',
                }}
              />
            </div>
          )}
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: 'Lora',
            data: lora,
            style: 'normal',
          },
          {
            name: 'Inter',
            data: inter,
            style: 'normal',
          },
        ],
      },
    )
  } catch (e) {
    loraBuffer = null
    interBuffer = null
    console.error('[og] ImageResponse generation failed', e)
    res.status(500).send('Failed to generate OG image')
    return
  }

  try {
    // ImageResponse is a Web API Response. Pipe its body into NextApiResponse.
    const arrayBuffer = await imageResponse.arrayBuffer()
    const pngBuffer = Buffer.from(arrayBuffer)

    if (asJpeg) {
      // Strapi's lifecycle hook calls this path to store a JPEG in the CMS media library
      const jpegBuffer = await sharp(pngBuffer)
        .jpeg({ quality: 75, progressive: true, mozjpeg: true })
        .toBuffer()
      res.setHeader('Content-Type', 'image/jpeg')
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
      res.status(200).send(jpegBuffer)
      return
    }

    res.setHeader('Content-Type', 'image/png')
    res.setHeader('Cache-Control', 'public, max-age=3600, immutable')
    res.status(200).send(pngBuffer)
  } catch (e) {
    console.error('[og] Failed to pipe image response', e)
    res.status(500).send('Failed to send OG image')
  }
}
