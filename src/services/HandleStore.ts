import { createStore, del, get, set } from 'idb-keyval'

export class HandleStore {
  private static _fileStore = createStore('web-fs-file', 'keyval')
  private static _dirStore = createStore('web-fs-dir', 'keyval')

  private constructor() {}

  static getFile(id: string): Promise<FileSystemFileHandle[] | undefined> {
    return get<FileSystemFileHandle[]>(id, this._fileStore)
  }

  static getDir(id: string): Promise<FileSystemDirectoryHandle | undefined> {
    return get<FileSystemDirectoryHandle>(id, this._dirStore)
  }

  static async setFile(id: string, entries: FileSystemFileHandle[]): Promise<void> {
    await set(id, entries, this._fileStore)
  }

  static async setDir(id: string, entry: FileSystemDirectoryHandle): Promise<void> {
    await set(id, entry, this._dirStore)
  }

  static async delFile(id: string): Promise<void> {
    await del(id, this._fileStore)
  }

  static async delDir(id: string): Promise<void> {
    await del(id, this._dirStore)
  }
}
