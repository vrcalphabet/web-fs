/** ファイルやディレクトリを選択する際の共通オプションです。 */
export type WebFsPickOptions = {
  /** ファイルやディレクトリに対する権限を、`"read"`または`"readwrite"`で指定します。 */
  mode?: FileSystemPermissionMode;
  /** ダイアログを開く際の初期ディレクトリを指定します。 */
  startIn?: WellKnownDirectory;
  /** 選択可能なファイルの種類を指定します。 */
  types?: WebFsFilePickType[];
} & (
  | {
      /** 設定を保存するためのIDです。 */
      id: string;
      /** 永続化するかどうかを指定します。 */
      persistence: true;
    }
  | {
      /** 設定を保存するためのIDです。 */
      id?: string;
      /** 永続化するかどうかを指定します。 */
      persistence?: false;
    }
);

/** ファイルを選択する際のオプションです。 */
export type WebFsFilePickOptions = WebFsPickOptions & {
  /** 指定されている拡張子とは別に、すべての拡張子を許可する項目を追加します。 */
  acceptAllExtensions?: boolean;
};

/** ディレクトリを選択する際のオプションです。 */
export type WebFsDirectoryPickOptions = WebFsPickOptions & {};

/** 権限に関するオプションです。 */
export interface WebFsPermissionOptions {
  /** ファイルやディレクトリに対する権限を、`"read"`または`"readwrite"`で指定します。 */
  mode?: FileSystemPermissionMode;
}

/** ファイルを取得する際のオプションです。 */
export interface WebFsGetFileOptions
  extends FileSystemGetFileOptions, WebFsPermissionOptions {}

/** ディレクトリを取得する際のオプションです。 */
export interface WebFsGetDirectoryOptions
  extends FileSystemGetDirectoryOptions, WebFsPermissionOptions {}

/** ハッシュ化するアルゴリズムの種類です。 */
export type WebFsFileHashType = "md5" | "sha256" | "sha512";

export interface WebFsFileInfo {
  /** ファイルの名前です。 */
  name: string;
  /** ファイルサイズです。単位はバイトです。 */
  size: number;
  /** ファイルのMIMEタイプです。 */
  mimeType: string;
  /** ファイルの最終更新日時です。 */
  lastModified: number;
}

/** ファイルの種類を定義するオブジェクトです。 */
export interface WebFsFilePickType {
  /** ファイルの種類の、ユーザー向けの説明です。 */
  description?: string;
  /** 許可するMIMEタイプと拡張子のリストです。 */
  accept: FileExtension[];
}

/** エントリーリストを取得する際のオプションです。 */
export interface WebFsEntryListOptions {
  /** 要素にファイルハンドルを含めるかを指定します。デフォルトは`true`です。 */
  file?: boolean;
  /** 要素にディレクトリハンドルを含めるかを指定します。デフォルトは`true`です。 */
  dir?: boolean;
  /** 再帰する深さを指定します。デフォルトは`1`です。 */
  depth?: number;
}

/** ツリー形式のファイル構造を表すオブジェクトです。 */
export type WebFsTreeResult =
  | {
      /** ディレクトリハンドルです。 */
      handle: FileSystemFileHandle;
      /** ディレクトリ内の子要素のリストです。 */
      children: undefined;
    }
  | {
      /** ディレクトリハンドルです。 */
      handle: FileSystemDirectoryHandle;
      /** ディレクトリ内の子要素のリストです。 */
      children: WebFsTreeResult[];
    };
