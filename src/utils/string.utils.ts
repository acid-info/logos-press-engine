// a function that calculate the similarity between two strings
export const similarity = (s1: string, s2: string): number => {
  const longer = s1.length > s2.length ? s1 : s2
  const shorter = s1.length > s2.length ? s2 : s1
  const longerLength = longer.length
  if (longerLength === 0) {
    return 1.0
  }
  return (
    (longerLength - editDistance(longer, shorter)) /
    parseFloat(longerLength.toString())
  )
}

function editDistance(s1: string, s2: string) {
  s1 = s1.toLowerCase()
  s2 = s2.toLowerCase()

  let costs = new Array()
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i
    for (let j = 0; j <= s2.length; j++) {
      if (i == 0) costs[j] = j
      else {
        if (j > 0) {
          let newValue = costs[j - 1]
          if (s1.charAt(i - 1) != s2.charAt(j - 1))
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1
          costs[j - 1] = lastValue
          lastValue = newValue
        }
      }
    }
    if (i > 0) costs[s2.length] = lastValue
  }
  return costs[s2.length]
}

export const calcReadingTime = (text: string): number => {
  const wordsPerMinute = 200
  const numberOfWords = text.split(/\s/g).length
  return Math.ceil(numberOfWords / wordsPerMinute)
}

export function convertSecToMinAndSec(totalSeconds: number) {
  // Convert seconds to minutes and seconds
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = Math.floor(totalSeconds % 60)

  // Ensure two digit format
  const formattedMinutes = String(minutes).padStart(2, '0')
  const formattedSeconds = String(seconds).padStart(2, '0')

  return `${formattedMinutes}:${formattedSeconds}`
}

export function extractUUIDFromEpisode(url: string) {
  const regex = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/
  const match = url.match(regex)
  return match ? match[1] : null
}

export function convertToIframe(url: string) {
  if (!url) return ''

  return `<iframe height="200px" width="100%" frameborder="no" scrolling="no" seamless src="${url}"></iframe>`
}

const removeFootnoteReferences = (text: string) =>
  text.replaceAll(/\[\d+\]/g, '')

// export const parseTranscriptionText = (text: string) => {
//   const time = text.match(/^(\d{1,2}:?){2,3}/g)?.[0] ?? ''
//   const transcript = removeFootnoteReferences(
//     time ? text.replace(time, '') : text,
//   ).trim()

//   const parsedTime = time.endsWith(':') ? time.slice(0, -1) : time
//   const parsedTranscript = transcript.replace(/^(-|\||\s)*/, '')

//   return {
//     time: parsedTime,
//     transcript: parsedTranscript,
//   }
// }

export function parseTranscriptionText(transcript: string) {
  const regex = /\[(\d{2}:\d{2}:\d{2})\]\s*(.*?):\s*(.*)/

  const match = transcript.match(regex)

  if (!match) {
    return {
      time: '',
      speaker: '',
      transcript: '',
    }
  }

  return {
    time: match[1],
    speaker: match[2],
    transcript: removeFootnoteReferences(match[3]).trim(),
  }
}

export function formatTagText(tag: string) {
  return tag.replace(/_/g, ' ')
}

export function formatEventType(type: string): string {
  return type
    .split(/[- ]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export function isValidTopic(topic: string | null | undefined): boolean {
  return !!(
    topic &&
    topic !== 'null' &&
    typeof topic === 'string' &&
    topic.trim() !== ''
  )
}

export function cleanUpUrlsInRawHtml(rh: string): string {
  const regex = /<a href="(.*)">(.*)<\/a>/g
  const matches = rh.matchAll(regex) || []
  let newRh = rh

  // TODO TS complains about matches not being iterable
  for (const match of matches as any) {
    const url = match[1]
    const text = match[2]
    // clean the text by removing http:// or https:// or www.
    const cleanText = text.replace(/(http:\/\/|https:\/\/|www\.)/g, '')
    newRh = newRh.replace(match[0], `<a href="${url}">${cleanText}</a>`)
  }
  return newRh
}

/**
 * Normalizes an unknown value to a comma-separated string.
 * Arrays are joined with commas, other values are converted to strings.
 */
export const normalizeString = (val: unknown): string =>
  Array.isArray(val) ? val.join(',') : String(val ?? '')

/**
 * Normalizes an unknown value to a space-separated query string.
 * Arrays are joined with spaces, other values are converted to strings.
 */
export const normalizeQuery = (val: unknown): string =>
  Array.isArray(val) ? val.join(' ') : String(val ?? '')

/**
 * Parses a comma-separated string into an array of trimmed, non-empty strings.
 */
export const parseCommaSeparated = (str: string): string[] =>
  str
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
