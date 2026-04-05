import { WebFsPermissionDenied } from './errors/WebFsPermissionDenied'
import { createHandle, createHandles } from './lib/createHandle'
import { pickDirectorySafe, pickFileSafe } from './lib/openPicker'
import { WebFsDirectoryHandle } from './services/WebFsDirectoryHandle'
import { WebFsFileHandle } from './services/WebFsFileHandle'
import { FileSystemEntry, WebFsEntry } from './types/entry'
import {
  WebFsDirectoryPickOptions,
  WebFsFilePickOptions,
  WebFsPermissionOptions,
} from './types/options'

export type * from './types'
export * from './services/WebFsHandle'
export * from './services/WebFsFileHandle'
export * from './services/WebFsDirectoryHandle'
export * from './utils/filter'

/**
 * ブラウザが`web-fs`に対応しているかを確認します。\
 * 値として`false`が返った場合は、その他の関数や`WebFs*`クラスを使用できません。
 *
 * @returns 対応している場合は`true`、そうでない場合は`false`。
 */
export function supportsWebFs(): boolean {
  return (
    globalThis.isSecureContext &&
    'showOpenFilePicker' in globalThis &&
    'showDirectoryPicker' in globalThis
  )
}

/**
 * ユーザに単一のファイルを選択させ、そのファイルを`WebFsFileHandle`でラップしたものを返します。
 *
 * @param options ファイル選択のオプション。
 * @returns 成功した場合は`WebFsFileHandle`、選択を取り消した場合やエラーが出た場合は`undefined`。
 */
export async function pickFile(
  options: WebFsFilePickOptions = {},
): Promise<WebFsFileHandle | WebFsPermissionDenied | undefined> {
  const fileEntries = await pickFileSafe(options, false)
  if (!fileEntries) return undefined

  return createHandle(fileEntries[0], options.mode)
}

/**
 * ユーザに複数のファイルを選択させ、そのファイルリストを返します。
 *
 * @param options ファイル選択のオプション。
 * @returns 成功した場合は`WebFsFileHandleList`、選択を取り消した場合やエラーが出た場合は`undefined`。
 */
export async function pickFiles(
  options: WebFsFilePickOptions = {},
): Promise<(WebFsFileHandle | WebFsPermissionDenied)[] | undefined> {
  const fileEntries = await pickFileSafe(options, true)
  if (!fileEntries) return undefined

  return createHandles(fileEntries, options.mode)
}

/**
 * ユーザに単一のディレクトリを選択させ、そのディレクトリを`WebFsDirectoryHandle`でラップしたものを返します。
 *
 * @param options ディレクトリ選択のオプション。
 * @returns 成功した場合は`WebFsDirectoryHandle`、選択を取り消した場合やエラーが出た場合は`undefined`。
 */
export async function pickDirectory(
  options: WebFsDirectoryPickOptions = {},
): Promise<WebFsDirectoryHandle | WebFsPermissionDenied | undefined> {
  const dirEntry = await pickDirectorySafe(options)
  if (!dirEntry) return undefined

  return createHandle(dirEntry, options.mode)
}

/**
 * ファイルを`WebFsFileHandle`でラップしたものを返します。
 *
 * @param fileEntry すでに取得している`FileSystemFileHandle`。
 * @param options 権限のオプション。
 * @returns `WebFsFileHandle`、権限が拒否された場合は`WebFsPermissionDenied`。
 */
export function mount(
  fileEntry: FileSystemFileHandle,
  options?: WebFsPermissionOptions,
): Promise<WebFsFileHandle | WebFsPermissionDenied>
/**
 * ファイルを`WebFsDirectoryHandle`でラップしたものを返します。
 *
 * @param dirEntry すでに取得している`FileSystemDirectoryHandle`。
 * @param options 権限のオプション。
 * @returns `WebFsDirectoryHandle`、権限が拒否された場合は`WebFsPermissionDenied`。
 */
export function mount(
  dirEntry: FileSystemDirectoryHandle,
  options?: WebFsPermissionOptions,
): Promise<WebFsDirectoryHandle | WebFsPermissionDenied>
export function mount(
  entry: FileSystemEntry,
  options: WebFsPermissionOptions = {},
): Promise<WebFsEntry | WebFsPermissionDenied> {
  return createHandle(entry, options.mode)
}
