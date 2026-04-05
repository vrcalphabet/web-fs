import { GlobOptions } from 'web-fs-glob'

/** ファイルやディレクトリを選択する際の共通オプションです。 */
export type WebFsPickOptions = WebFsPermissionOptions & {
  /** ダイアログを開く際の初期ディレクトリを指定します。 */
  startIn?: WellKnownDirectory
  /**
   * IDごとに、前回開いたディレクトリを記憶します。**idには、26文字の文字数上限があります。**\
   * 文字数上限を超えた場合は、`TypeError`がスローされます。
   *
   * ネイティブのidの文字数上限は32文字ですが、必ず`webfs_`というプレフィックスがつくため、`32 - 6 = 26`文字となります。
   */
  id?: string
  /** 取得したハンドルをデータベースに保存して永続化するかどうかを指定します。 */
  persistence?: boolean
} & (
    | {
        id: string
        persistence: true
      }
    | {
        id?: string
        persistence?: false
      }
  )

/** ファイルを選択する際のオプションです。 */
export type WebFsFilePickOptions = WebFsPickOptions & {
  /** 指定されている拡張子とは別に、すべての拡張子を許可する項目を追加します。デフォルトは`false`です。 */
  acceptAllExtensions?: boolean
  /** 選択可能なファイルの種類を指定します。 */
  types?: WebFsFilePickType[]
}

/** ディレクトリを選択する際のオプションです。 */
export type WebFsDirectoryPickOptions = WebFsPickOptions

/** ファイルハンドルを取得する際の権限モードを指定するオプションです。 */
export type WebFsPermissionOptions = {
  /** ハンドルに対する権限を、`"read"`または`"readwrite"`で指定します。デフォルトは`"read"`です。 */
  mode?: FileSystemPermissionMode
}

/** ファイルの種類を定義するオブジェクトです。 */
export type WebFsFilePickType = {
  /** ファイルの種類の、ユーザー向けの説明です。 */
  description?: string
  /** 許可するMIMEタイプと拡張子のリストです。 */
  accept: FileExtension[]
}

/** ファイルやディレクトリを取得する際のオプションです。 */
export type WebFsGetOptions = WebFsPermissionOptions & {
  /** ファイルやディレクトリが存在しない場合に再帰的にエントリーを作成するかを指定します。デフォルトは`false`です。 */
  create?: boolean
}

/** ハッシュ化するアルゴリズムの種類です。 */
export type WebFsFileHashType = 'md5' | 'sha1' | 'sha256' | 'sha384' | 'sha512'

/** エントリーリストを取得する際のオプションです。 */
export type WebFsListOptions = {
  /** 要素にファイルハンドルを含めるかを指定します。デフォルトは`true`です。 */
  file?: boolean
  /** 要素にディレクトリハンドルを含めるかを指定します。デフォルトは`true`です。 */
  dir?: boolean
}

/** ツリー形式でエントリを取得する際のオプションです。 */
export type WebFsTreeOptions = {
  /** 要素にファイルハンドルを含めるかを指定します。デフォルトは`true`です。 */
  file?: boolean
  /** 再帰する深さを指定します。デフォルトは`1`です。 */
  maxDepth?: number
}

/** globでエントリを取得する際のオプションです。 */
export type WebFsGlobOptions = Omit<GlobOptions, 'cwd'> & WebFsPermissionOptions

/** ファイルに書き込みを行う際のオプションです。 */
export type WebFsWriteOptions = {
  /** ファイルの書き込みを追記モードにします。`false`の場合は、ファイルを上書きします。デフォルトは`true`です。 */
  append?: boolean
}
