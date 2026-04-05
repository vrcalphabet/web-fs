export abstract class WebFsHandle {
  abstract readonly type: 'file' | 'directory'
  protected readonly _entry: FileSystemHandle

  /**
   * ファイルハンドルの名前。ファイル名やディレクトリ名を表します。
   */
  get name() {
    return this._entry.name
  }

  /**
   * ネイティブの`FileSystemHandle`を返します。
   */
  get handle() {
    return this._entry
  }

  protected constructor(entry: FileSystemHandle) {
    this._entry = entry
  }

  /**
   * 指定したモードの権限が現在付与されているかを確認します。
   *
   * @param mode 確認する権限のモード。`"read"`または`"readwrite"`を指定します。
   * @returns 権限が付与されている場合は`true`、そうでない場合は`false`。
   */
  async can(mode: FileSystemPermissionMode): Promise<boolean> {
    return (await this._entry.queryPermission({ mode })) === 'granted'
  }

  /**
   * 指定したモードの権限をリクエストします。\
   * 権限が未付与の場合はブラウザの確認ダイアログが表示されます。
   *
   * @param mode リクエストする権限のモード。`"read"`または`"readwrite"`を指定します。
   * @returns 権限が付与された場合は`true`、拒否された場合は`false`。
   */
  async request(mode: FileSystemPermissionMode): Promise<boolean> {
    return this._verifyPermission(mode)
  }

  protected async _verifyPermission(
    mode: FileSystemPermissionMode,
  ): Promise<boolean> {
    if ((await this._entry.queryPermission({ mode })) === 'granted') {
      return true
    }

    if ((await this._entry.requestPermission({ mode })) === 'granted') {
      return true
    }

    return false
  }
}
