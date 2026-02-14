import { WebFsFileHandle } from './WebFsFileHandle'

export class WebFsFileHandleList {
  private _handles

  private constructor(handles: WebFsFileHandle[]) {
    this._handles = handles
  }

  /**
   * ファイルを`WebFsFileHandleList`（`WebFsFileHandle`の配列）でラップしたものを返します。
   *
   * @param handles すでに取得しているファイルハンドルの配列。
   * @param mode ファイルのオプション。
   * @returns 成功した場合は`WebFsFileHandleList`、エラーが出た場合は`undefined`。
   */
  static async create(
    handles: FileSystemFileHandle[],
    mode: FileSystemPermissionMode = 'read',
  ): Promise<WebFsFileHandleList | undefined> {
    const validHandles = await Promise.all(
      handles.map((handle) => WebFsFileHandle.create(handle, mode)),
    )
    if (validHandles.includes(undefined)) {
      return undefined
    }

    const instance = new this(validHandles as WebFsFileHandle[])
    return instance
  }

  /**
   * ファイルを取得します。
   *
   * @param fileName 取得するファイルのファイル名。
   * @returns ファイルが取得できた場合は`WebFsFileHandle`、存在しない場合は`undefined`。
   */
  file(fileName: string): WebFsFileHandle | undefined {
    return this._handles.find((handle) => handle.name === fileName)
  }

  /**
   * ファイル名の一覧を取得します。
   *
   * @returns ファイル名の配列を返します。
   */
  names(): string[] {
    return this._handles.map((handle) => handle.name)
  }

  /**
   * ファイルハンドルの一覧を取得します。
   *
   * @returns ファイルハンドルの配列を返します。
   */
  list(): WebFsFileHandle[] {
    return this._handles
  }

  /**
   * 現在の`WebFsFileHandleList`インスタンスが管理しているファイルハンドルの数を取得します。
   */
  get length(): number {
    return this._handles.length
  }

  *[Symbol.iterator]() {
    yield* this._handles
  }
}
