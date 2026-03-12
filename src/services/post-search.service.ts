import lunr from 'lunr'
import { LPE } from '../types/lpe.types'

type Post = {
  index: lunr.Index
}

// Maximum number of Lunr indexes held in memory at once.
// Lunr indexes are non-trivial in size (they store a full inverted index of
// the document text). Without a cap, every article that is searched adds a
// permanent entry to the globalThis singleton that never gets evicted, causing
// unbounded memory growth over the lifetime of the server process.
const MAX_INDEX_CACHE_SIZE = 50

export class PostSearchService {
  posts: Record<string, Post> = {}

  constructor() {
    this.posts = {}
  }

  index = (post: Pick<LPE.Post.Document, 'id' | 'content'>) => {
    const id = post.id
    delete this.posts[id]

    // Evict the oldest entry when the cache is at capacity to prevent
    // unbounded growth on a long-lived server process.
    const keys = Object.keys(this.posts)
    if (keys.length >= MAX_INDEX_CACHE_SIZE) {
      delete this.posts[keys[0]]
    }

    const index = lunr(function () {
      this.ref('index')
      this.field('text')

      post.content.forEach((block, index) => {
        this.add({
          index,
          text: block.type === 'text' ? block.text : block.caption,
        })
      })
    })

    this.posts[id] = { index }

    return id
  }

  search = (id: string, query: string) => {
    const post = this.posts[id]
    if (!post) return []

    const idx = post.index
    const results = idx.search(query + '~1')

    return results.map((r) => ({
      score: r.score,
      index: parseInt(r.ref, 10),
    }))
  }
}

const postSearchService: PostSearchService = (() => {
  const _globalThis = globalThis as any
  if (!_globalThis.postSearchService)
    _globalThis.postSearchService = new PostSearchService()

  return _globalThis.postSearchService
})()

export default postSearchService as PostSearchService
