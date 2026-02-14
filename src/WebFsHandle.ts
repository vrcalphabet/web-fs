export abstract class WebFsHandle {
  abstract readonly type: 'file' | 'directory'
  protected _handle: FileSystemHandle

  protected constructor(handle: FileSystemHandle) {
    this._handle = handle
  }

  /**
   * ファイルハンドルの名前。ファイル名やディレクトリ名を表します。
   */
  get name() {
    return this._handle.name
  }

  protected async _verifyPermission(mode: FileSystemPermissionMode) {
    if ((await this._handle.queryPermission({ mode })) === 'granted') {
      return true
    }

    if ((await this._handle.requestPermission({ mode })) === 'granted') {
      return true
    }

    return false
  }
}
