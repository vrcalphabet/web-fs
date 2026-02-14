import { WebFsHandle } from './WebFsHandle'
import { WebFsFileHashType, WebFsFileInfo } from './types'
import md5 from 'md5'

export class WebFsFileHandle extends WebFsHandle {
  /**
   * ファイルハンドルの種類。常に`"file"`を返します。
   */
  readonly type = 'file'
  protected _handle

  private constructor(handle: FileSystemFileHandle) {
    super(handle)
    this._handle = handle
  }

  /**
   * ファイルを`WebFsFileHandle`でラップしたものを返します。
   *
   * @param handle すでに取得しているファイルハンドル。
   * @param mode ファイルのオプション。
   * @returns 成功した場合は`WebFsFileHandle`、エラーが出た場合は`undefined`。
   */
  static async create(
    handle: FileSystemFileHandle,
    mode: FileSystemPermissionMode = 'read',
  ): Promise<WebFsFileHandle | undefined> {
    const instance = new this(handle)
    const verified = await instance._verifyPermission(mode)
    if (!verified) return undefined

    return instance
  }

  /**
   * ファイルの情報を返します。\
   * これには、ファイル名、ファイルサイズ、MIMEの種類、パス、最終更新日時が含まれます。
   *
   * @returns ファイルの情報。
   */
  async info(): Promise<WebFsFileInfo> {
    const file = await this._handle.getFile()
    return {
      name: file.name,
      size: file.size,
      mimeType: file.type,
      lastModified: file.lastModified,
    }
  }

  /**
   * ファイルの内容をUTF-8形式の文字列として取得します。
   *
   * @returns ファイルの内容を解釈した文字列を返します。
   */
  async text(): Promise<string> {
    return (await this._handle.getFile()).text()
  }

  /**
   * ファイルの内容をUTF-8形式のJSONと解釈したうえで、オブジェクトに変換して返します。
   *
   * @returns 有効なJSON構文である場合は`unknown`、そうでない場合は`undefined`が返ります。
   */
  async json<T = unknown>(): Promise<T | undefined> {
    try {
      return JSON.parse(await this.text()) as T
    } catch {
      return undefined
    }
  }

  /**
   * ファイルを`Blob`として取得します。
   *
   * @returns ファイルの`Blob`オブジェクト。
   */
  async blob(): Promise<Blob> {
    return await this._handle.getFile()
  }

  /**
   * ファイルを`arrayBuffer`として取得します。
   *
   * @returns ファイルの`arrayBuffer`オブジェクト。
   */
  async arrayBuffer(): Promise<ArrayBuffer> {
    return (await this.blob()).arrayBuffer()
  }

  /**
   * ファイルのハッシュ値を取得します。\
   * ハッシュ値のアルゴリズムは、`md5`、`sha256`、`sha512`から選べます。
   *
   * @returns ハッシュ化された16進数の文字列。
   */
  async hash(algo: WebFsFileHashType = 'sha256'): Promise<string> {
    if (algo === 'md5') {
      const text = await this.text()
      return md5(text)
    } else {
      const buffer = await this.arrayBuffer()
      const hashBuffer = await crypto.subtle.digest(
        { sha256: 'SHA-256', sha512: 'SHA-512' }[algo],
        buffer,
      )
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const hash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
      return hash
    }
  }

  /**
   * ファイルの内容を`data`の内容で**上書き**します。
   *
   * @returns ファイルの書き込みに成功した場合は`true`、失敗した場合は`false`。
   */
  async write(data: string): Promise<boolean> {
    return this._write({ data, append: false })
  }

  /**
   * ファイルの内容に`data`の内容を追記します。
   *
   * @returns ファイルの書き込みに成功した場合は`true`、失敗した場合は`false`。
   */
  async append(data: string): Promise<boolean> {
    return this._write({ data, append: true })
  }

  /**
   * ファイルの読み込みストリームを取得します。
   *
   * @returns ファイルの読み込みストリーム。
   */
  async readStream(): Promise<ReturnType<Blob['stream']>> {
    const file = await this._handle.getFile()
    return file.stream()
  }

  /**
   * ファイルの書き込みストリームを取得します。
   *
   * @returns ファイルの書き込みストリーム。
   */
  async writeStream(
    options?: FileSystemCreateWritableOptions,
  ): Promise<FileSystemWritableFileStream> {
    return await this._handle.createWritable(options)
  }

  private async _write(options: { data: string; append: boolean }) {
    try {
      const writeStream = await this._handle.createWritable({
        keepExistingData: options.append,
      })

      if (options.append) {
        const file = await this._handle.getFile()
        writeStream.seek(file.size)
      }

      writeStream.write(options.data)
      writeStream.close()
      return true
    } catch {
      return false
    }
  }
}
