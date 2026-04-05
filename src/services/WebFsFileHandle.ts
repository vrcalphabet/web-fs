import md5 from 'md5'
import { WebFsPermissionDenied } from '../errors/WebFsPermissionDenied'
import { WebFsFileHashType, WebFsFileInfo, WebFsWriteOptions } from '../types'
import { getHash } from '../utils/hash'
import { WebFsHandle } from './WebFsHandle'

export class WebFsFileHandle extends WebFsHandle {
  /**
   * ファイルハンドルの種類。常に`"file"`を返します。
   */
  readonly type = 'file'
  declare readonly _entry: FileSystemFileHandle

  get handle() {
    return this._entry
  }

  private constructor(fileEntry: FileSystemFileHandle) {
    super(fileEntry)
  }

  /**
   * ファイルを`WebFsFileHandle`でラップしたものを返します。
   *
   * @param fileEntry すでに取得しているファイルハンドル。
   * @param mode 取得する権限。
   * @returns 成功した場合は`WebFsFileHandle`、権限が取得できない場合は`WebFsPermissionDenied`。
   */
  static async create(
    fileEntry: FileSystemFileHandle,
    mode: FileSystemPermissionMode = 'read',
  ): Promise<WebFsFileHandle | WebFsPermissionDenied> {
    const fileHandle = new this(fileEntry)

    const verified = await fileHandle._verifyPermission(mode)
    if (!verified) return new WebFsPermissionDenied(fileEntry)

    return fileHandle
  }

  /**
   * ファイルの情報を返します。
   * これには、ファイル名、ファイルサイズ、MIMEの種類、最終更新日時が含まれます。
   *
   * @returns ファイルの情報。
   */
  async info(): Promise<WebFsFileInfo> {
    const file = await this._entry.getFile()
    return {
      name: file.name,
      size: file.size,
      mimeType: file.type,
      lastModified: file.lastModified,
      lastModifiedDate: new Date(file.lastModified),
    }
  }

  /**
   * ファイルの内容をUTF-8形式の文字列として取得します。
   *
   * @returns ファイルの内容を解釈した文字列を返します。
   */
  async text(): Promise<string> {
    return (await this._entry.getFile()).text()
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
  blob(): Promise<Blob> {
    return this._entry.getFile()
  }

  /**
   * ファイルを`arrayBuffer`として取得します。
   *
   * @returns ファイルの`arrayBuffer`オブジェクト。
   */
  async arrayBuffer(): Promise<ArrayBuffer> {
    const file = await this._entry.getFile()
    return file.arrayBuffer()
  }

  /**
   * ファイルのハッシュ値を取得します。
   *
   * @param algo ハッシュアルゴリズムの種類。
   * @returns ハッシュ化された16進数の文字列。
   */
  async hash(algo: WebFsFileHashType): Promise<string> {
    const buffer = await this.arrayBuffer()
    if (algo === 'md5') {
      return md5(new Uint8Array(buffer))
    } else {
      return getHash(algo, buffer)
    }
  }

  /**
   * ファイルの内容に`data`の内容を書き込みます。
   *
   * `options.append`が`false`の場合は上書き、`true`の場合は追記します。
   *
   * @param data 書き込む文字列。
   * @param options 書き込みオプション。
   * @returns ファイルの書き込みに成功した場合は`true`、失敗した場合は`false`。
   */
  async write(data: string, options: WebFsWriteOptions = {}): Promise<boolean> {
    const { append = true } = options

    try {
      const writeStream = await this._entry.createWritable({
        keepExistingData: append,
      })

      if (append) {
        const file = await this._entry.getFile()
        await writeStream.seek(file.size)
      }

      await writeStream.write(data)
      await writeStream.close()
      
      return true
    } catch {
      return false
    }
  }

  /**
   * ファイルの読み込みストリームを取得します。
   *
   * @returns ファイルの読み込みストリーム。
   */
  async readStream(): Promise<ReadableStream<Uint8Array<ArrayBuffer>>> {
    const file = await this._entry.getFile()
    return file.stream()
  }

  /**
   * ファイルの書き込みストリームを取得します。
   *
   * @param options ストリーム作成のオプション。
   * @returns ファイルの書き込みストリーム。
   */
  writeStream(
    options: FileSystemCreateWritableOptions = {},
  ): Promise<FileSystemWritableFileStream> {
    return this._entry.createWritable(options)
  }
}
