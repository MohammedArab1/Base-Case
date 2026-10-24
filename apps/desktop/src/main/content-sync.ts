import type { ContentRepository } from './content'
import type { AppDatabase } from './database'

/**
 * Reload every pack and rebuild the search index. Used at startup and after a
 * pack is installed or removed so both live in one place.
 */
export async function rebuildContentIndex(
  content: ContentRepository,
  database: AppDatabase,
  userDataPath: string,
): Promise<void> {
  await content.initialize(userDataPath)
  database.replaceProblemIndex(content.searchDocuments())
}
