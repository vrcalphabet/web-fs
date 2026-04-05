import { WebFsPermissionDenied } from '../errors/WebFsPermissionDenied'
import { WebFsDirectoryHandle } from '../services/WebFsDirectoryHandle'
import { WebFsFileHandle } from '../services/WebFsFileHandle'
import { FileSystemEntry } from '../types/entry'

type ResolveHandle<T> =
  | (T extends FileSystemFileHandle ? WebFsFileHandle : WebFsDirectoryHandle)
  | WebFsPermissionDenied

export async function createHandles<T extends FileSystemEntry>(
  entries: T[],
  mode: FileSystemPermissionMode = 'read',
): Promise<ResolveHandle<T>[]> {
  const result = entries.map((entry) => createHandle(entry, mode))
  return Promise.all(result)
}

export function createHandle<T extends FileSystemEntry>(
  entry: T,
  mode: FileSystemPermissionMode = 'read',
): Promise<ResolveHandle<T>> {
  if (entry instanceof FileSystemFileHandle) {
    // prettier-ignore
    return WebFsFileHandle.create(entry, mode) as unknown as Promise<ResolveHandle<T>>
  } else {
    // prettier-ignore
    return WebFsDirectoryHandle.create(entry, mode) as unknown as Promise<ResolveHandle<T>>
  }
}
