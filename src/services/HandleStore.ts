import { createStore, del, get, set } from "idb-keyval";

export class HandleStore {
  private static fileStore = createStore("web-fs-file", "keyval");
  private static directoryStore = createStore("web-fs-directory", "keyval");
  
  private constructor() {}

  static getFile(id: string): Promise<FileSystemFileHandle[] | undefined> {
    return get<FileSystemFileHandle[]>(id, this.fileStore);
  }

  static async setFile(id: string, handle: FileSystemFileHandle[]): Promise<void> {
    await set(id, handle, this.fileStore);
  }
  
  static async delFile(id: string): Promise<void> {
    await del(id, this.fileStore);
  }
  
  static getDirectory(id: string): Promise<FileSystemDirectoryHandle | undefined> {
    return get<FileSystemDirectoryHandle>(id, this.directoryStore);
  }

  static async setDirectory(id: string, handle: FileSystemDirectoryHandle): Promise<void> {
    await set(id, handle, this.directoryStore);
  }
  
  static async delDirectory(id: string): Promise<void> {
    await del(id, this.directoryStore);
  }
}
