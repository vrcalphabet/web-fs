export interface WebFsFileInfo {
  /** ファイルの名前です。 */
  name: string
  /** ファイルサイズです。単位はバイトです。 */
  size: number
  /** ファイルのMIMEタイプです。 */
  mimeType: string
  /** ファイルの最終更新日時です。 */
  lastModified: number
  /** Date型のファイルの最終更新日時です。 */
  lastModifiedDate: Date
}

export type WebFsTreeResult = {
  kind: 'directory'
  name: string
  /** ディレクトリハンドルです。 */
  handle: FileSystemDirectoryHandle
  /** ディレクトリ内の子要素のリストです。 */
  children: WebFsInnerTreeResult[]
}

export type WebFsInnerTreeResult =
  | {
      /** ハンドルの種類です。 */
      kind: 'file'
      /** ハンドルの名前（ファイル名）です。 */
      name: string
      /** ファイルハンドルです。 */
      handle: FileSystemFileHandle
      children: undefined
    }
  | {
      /** ハンドルの種類です。 */
      kind: 'directory'
      /** ハンドルの名前（ディレクトリ名）です。 */
      name: string
      /** ディレクトリハンドルです。 */
      handle: FileSystemDirectoryHandle
      /** ディレクトリ内の子要素のリストです。 */
      children: WebFsInnerTreeResult[]
    }
