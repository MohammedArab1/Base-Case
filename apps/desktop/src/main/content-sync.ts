import type { ContentRepository } from './content'
import type { ContentIndexRepository } from './repositories/content-index'

/**
 * Reload every pack and rebuild the search index. Used at startup and after a
 * pack is installed or removed so both live in one place.
 */
export async function rebuildContentIndex(
  content: ContentRepository,
  contentIndex: ContentIndexRepository,
  userDataPath: string,
): Promise<void> {
  await content.initialize(userDataPath)
  contentIndex.replace(content.searchDocuments())
}
