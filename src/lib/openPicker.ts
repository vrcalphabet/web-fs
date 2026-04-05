import { HandleStore } from '../services/HandleStore'
import { WebFsDirectoryPickOptions, WebFsFilePickOptions } from '../types/options'

function _openFilePicker(
  options: WebFsFilePickOptions,
  multiple: boolean,
): Promise<FileSystemFileHandle[]> {
  return globalThis.showOpenFilePicker({
    id: options.id && `webfs_${options.id}`,
    excludeAcceptAllOption: !options.acceptAllExtensions,
    startIn: options.startIn,
    multiple: multiple,
    types: options.types?.map(({ description, accept }) => ({
      description,
      accept: {
        '*/*': accept,
      },
    })),
  })
}

function _openDirectoryPicker(
  options: WebFsDirectoryPickOptions,
): Promise<FileSystemDirectoryHandle> {
  return globalThis.showDirectoryPicker({
    id: options.id && `webfs_${options.id}`,
    startIn: options.startIn,
  })
}

export async function pickFileSafe(
  options: WebFsFilePickOptions,
  multiple: boolean,
): Promise<FileSystemFileHandle[] | undefined> {
  try {
    if (options.persistence) {
      const fileListHandle = await HandleStore.getFile(options.id)
      if (fileListHandle) return fileListHandle
    }

    const fileHandle = await _openFilePicker(options, multiple)
    if (options.persistence) {
      HandleStore.setFile(options.id, fileHandle)
    }

    return fileHandle
  } catch (e) {
    if (e instanceof TypeError) throw e
    return undefined
  }
}

export async function pickDirectorySafe(
  options: WebFsDirectoryPickOptions,
): Promise<FileSystemDirectoryHandle | undefined> {
  try {
    if (options.persistence) {
      const dirHandle = await HandleStore.getDir(options.id)
      if (dirHandle) return dirHandle
    }

    const dirHandle = await _openDirectoryPicker(options)
    if (options.persistence) {
      HandleStore.setDir(options.id, dirHandle)
    }

    return dirHandle
  } catch (e) {
    if (e instanceof TypeError) throw e
    return undefined
  }
}
