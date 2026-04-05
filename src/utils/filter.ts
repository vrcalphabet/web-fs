import { WebFsHandle } from '../services/WebFsHandle'
import { WebFsEntry } from '../types/entry'

/**
 * 値が `WebFsEntry` (`WebFsFileHandle` または `WebFsDirectoryHandle`) であるかを確認します。
 *
 * @param handle 確認する値。
 * @returns `WebFsEntry` である場合は `true`、そうでない場合は `false`。
 */
export function isHandle(handle: unknown): handle is WebFsEntry {
  return handle instanceof WebFsHandle
}

/**
 * 配列から `WebFsEntry` (`WebFsFileHandle` または `WebFsDirectoryHandle`) のみを取り出します。
 *
 * @param handles フィルタリングする配列。
 * @returns `WebFsEntry` のみからなる配列。
 */
export function filterHandle(handles: unknown[]): WebFsEntry[] {
  return handles.filter(isHandle)
}
