import { SyncAdapter } from './syncAdapter'

/**
 * Shared persistence singleton used by every store. It is local-first and
 * becomes sync-aware once the sync store sets `userId`.
 */
export const persistence = new SyncAdapter()
