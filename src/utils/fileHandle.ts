export async function getDirectoryHandleSafe(
  handle: FileSystemDirectoryHandle,
  name: string,
  options?: FileSystemGetDirectoryOptions,
): Promise<FileSystemDirectoryHandle | undefined> {
  try {
    return await handle.getDirectoryHandle(name, options)
  } catch {
    return undefined
  }
}

export async function getFileHandleSafe(
  handle: FileSystemDirectoryHandle,
  name: string,
  options?: FileSystemGetFileOptions,
): Promise<FileSystemFileHandle | undefined> {
  try {
    return await handle.getFileHandle(name, options)
  } catch {
    return undefined
  }
}

export async function removeHandleSafe(
  handle: FileSystemDirectoryHandle,
  name: string,
): Promise<boolean> {
  try {
    await handle.removeEntry(name, { recursive: true })
    return true
  } catch {
    return false
  }
}
