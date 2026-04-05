import { glob } from 'web-fs-glob'
import { WebFsPermissionDenied } from '../errors/WebFsPermissionDenied'
import { createHandles } from '../lib/createHandle'
import { FileSystemEntry, WebFsEntry } from '../types/entry'
import {
  WebFsGetOptions,
  WebFsGlobOptions,
  WebFsListOptions,
  WebFsTreeOptions,
} from '../types/options'
import { WebFsInnerTreeResult, WebFsTreeResult } from '../types/results'
import {
  getDirectoryHandleSafe,
  getFileHandleSafe,
  removeHandleSafe,
} from '../utils/fileHandle'
import { filterHandle, isHandle } from '../utils/filter'
import { WebFsFileHandle } from './WebFsFileHandle'
import { WebFsHandle } from './WebFsHandle'

export class WebFsDirectoryHandle extends WebFsHandle {
  /**
   * ディレクトリハンドルの種類。常に`"directory"`を返します。
   */
  readonly type = 'directory'
  declare readonly _entry: FileSystemDirectoryHandle

  get handle() {
    return this._entry
  }

  private constructor(dirEntry: FileSystemDirectoryHandle) {
    super(dirEntry)
  }

  /**
   * ディレクトリハンドルを`WebFsDirectoryHandle`でラップします。
   *
   * @param dirEntry すでに取得しているディレクトリハンドル。
   * @param mode 取得する権限。
   * @returns 成功した場合は`WebFsFileHandle`、権限が取得できない場合は`WebFsPermissionDenied`。
   */
  static async create(
    dirEntry: FileSystemDirectoryHandle,
    mode: FileSystemPermissionMode = 'read',
  ): Promise<WebFsDirectoryHandle | WebFsPermissionDenied> {
    const dirHandle = new this(dirEntry)

    const verified = await dirHandle._verifyPermission(mode)
    if (!verified) return new WebFsPermissionDenied(dirEntry)

    return dirHandle
  }

  /**
   * ファイルを取得します。ファイル名またはファイルの相対パスを指定します。
   *
   * @param filePath 取得するファイルのパス。例：`package.json`、`src/cli/main.ts`
   * @param options ファイル取得のオプション。
   * @returns ファイルが取得できた場合は`WebFsFileHandle`、ファイルが存在しないまたは権限がない場合は`undefined`。
   */
  async getFile(
    filePath: string,
    options: WebFsGetOptions = {},
  ): Promise<WebFsFileHandle | undefined> {
    const dirNames = filePath.split('/')
    const fileName = dirNames.pop()!

    const dirEntry = await this._dirByPath(dirNames, options)
    if (!dirEntry) return undefined

    const fileEntry = await getFileHandleSafe(dirEntry, fileName, options)
    if (!fileEntry) return undefined

    const fileHandle = await WebFsFileHandle.create(fileEntry, options.mode)
    if (!isHandle(fileHandle)) return undefined

    return fileHandle
  }

  /**
   * ディレクトリを取得します。ディレクトリ名またはディレクトリの相対パスで指定します。
   *
   * @param dirPath 取得するディレクトリのパス。例：`src`、`src/services`
   * @param options ディレクトリ取得のオプション。
   * @returns ディレクトリが取得できた場合は`WebFsDirectoryHandle`、ディレクトリが存在しないまたは権限がない場合は`undefined`。
   */
  async getDir(
    dirPath: string,
    options: WebFsGetOptions = {},
  ): Promise<WebFsDirectoryHandle | undefined> {
    const dirNames = dirPath.split('/')

    const dirEntry = await this._dirByPath(dirNames, options)
    if (!dirEntry) return undefined

    const dirHandle = await WebFsDirectoryHandle.create(dirEntry)
    if (!isHandle(dirHandle)) return undefined

    return dirHandle
  }

  /**
   * ファイルを作成します。ファイル名またはファイルの相対パスで指定します。
   *
   * @param filePath 作成するファイルのパス。
   * @returns ファイルが作成できた場合は`WebFsFileHandle`、書き込み権限がない場合またはエラーの場合は`undefined`。
   */
  createFile(filePath: string): Promise<WebFsFileHandle | undefined> {
    return this.getFile(filePath, { create: true })
  }

  /**
   * ディレクトリを作成します。ディレクトリ名またはディレクトリの相対パスで指定します。
   *
   * @param dirPath 作成するディレクトリのパス。
   * @returns ディレクトリが作成できた場合は`WebFsDirectoryHandle`、書き込み権限がない場合またはエラーの場合は`undefined`。
   */
  createDir(dirPath: string): Promise<WebFsDirectoryHandle | undefined> {
    return this.getDir(dirPath, { create: true })
  }

  /**
   * ファイルまたはディレクトリを削除します。削除するエントリーがディレクトリであった場合は、その子孫を再帰的に削除します。
   *
   * @param entryPath 削除するファイルまたはディレクトリのパス。
   * @returns 削除に成功した場合は`true`、エントリーが存在しないまたはエラーの場合は`false`。
   */
  async remove(entryPath: string): Promise<boolean> {
    const entryNames = entryPath.split('/')
    const lastEntryName = entryNames.pop()!

    const dirEntry = await this._dirByPath(entryNames)
    if (!dirEntry) return false

    return removeHandleSafe(dirEntry, lastEntryName)
  }

  /**
   * ファイルやディレクトリの名前の一覧を取得します。
   *
   * @param options 一覧のオプション。
   * @returns ファイル名またはディレクトリ名からなる配列。
   */
  async names(options: WebFsListOptions = {}): Promise<string[]> {
    const handles = await this.list(options)
    return handles.map((entry) => entry.name)
  }

  /**
   * 現在の階層にあるファイルまたはディレクトリのハンドルの一覧を取得します。
   *
   * @param options 一覧のオプション。
   * @returns `WebFsFileHandle`または`WebFsDirectoryHandle`からなる配列。
   */
  async list(options: WebFsListOptions = {}): Promise<WebFsEntry[]> {
    const { file = true, dir = true } = options

    const entries = await Array.fromAsync(this._entry.values())
    const filteredEntries = entries.filter(
      (entry) => !this._shouldSkip(entry, { file, dir }),
    )
    const handles = await createHandles(filteredEntries)
    return filterHandle(handles)
  }

  /**
   * globパターンにマッチしたファイルやディレクトリの一覧を取得します。
   *
   * @param pattern globパターン。
   * @param options globのオプション。
   * @returns globパターンにマッチした`WebFsFileHandle`または`WebFsDirectoryHandle`の配列。
   */
  async glob(
    pattern: string,
    options: WebFsGlobOptions = {},
  ): Promise<WebFsEntry[]> {
    if (pattern === '') return []

    const result = await glob(pattern, { ...options, cwd: this._entry })
    const entries = result.map((entry) => entry.handle)

    const handles = await createHandles(entries, options.mode)
    return filterHandle(handles)
  }

  /**
   * ファイル構造をツリー形式のオブジェクトとして取得します。
   *
   * @param options ツリー取得のオプション。
   * @returns ツリー形式の`WebFsTreeResult`オブジェクト。
   */
  async tree(options: WebFsTreeOptions = {}): Promise<WebFsTreeResult> {
    const entryTree = await this._treeRecursive(options)
    return {
      kind: 'directory',
      name: this._entry.name,
      handle: this._entry,
      children: entryTree,
    }
  }

  /**
   * ファイル構造を文字列のツリー形式として取得します。
   *
   * 返り値の例：
   * ```text
   * babel/
   *  ├─ code-frame/
   *  │  ├─ lib/
   *  │  ├─ LICENSE
   *  │  ├─ package.json
   *  │  └─ README.md
   *  ├─ compat-data/
   *  │  ├─ data/
   *  │  ├─ corejs3-shipped-proposals.js
   *  │  ├─ plugin-bugfixes.js
   *  │  ├─ corejs2-built-ins.js
   *  ...
   * ```
   *
   * @returns ツリー形式の文字列。
   */
  async stringifyTree(options: WebFsTreeOptions = {}): Promise<string> {
    const tree = await this.tree(options)

    const lines = this._stringifyTreeRecursive(tree)
    return lines.join('\n')
  }

  private _shouldSkip(
    entry: FileSystemEntry,
    options: Required<WebFsListOptions>,
  ): boolean {
    if (entry instanceof FileSystemFileHandle) return !options.file
    if (entry instanceof FileSystemDirectoryHandle) return !options.dir
    return true
  }

  private async _treeRecursive(
    options: WebFsTreeOptions,
    _depth: number = 1,
    _cd: FileSystemDirectoryHandle = this._entry,
  ): Promise<WebFsInnerTreeResult[]> {
    const { file = true, maxDepth = 1 } = options

    const list: WebFsInnerTreeResult[] = []
    for await (const entry of _cd.values()) {
      if (entry instanceof FileSystemFileHandle) {
        if (!file) continue
        list.push({
          kind: 'file',
          name: entry.name,
          handle: entry,
          children: undefined,
        })
      } else {
        // prettier-ignore
        const children =
          _depth === maxDepth
            ? []
            : await this._treeRecursive(options, _depth + 1, entry)

        list.push({
          kind: 'directory',
          name: entry.name,
          handle: entry,
          children: children,
        })
      }
    }

    return list
  }

  private _stringifyTreeRecursive(tree: WebFsInnerTreeResult): string[] {
    if (tree.kind === 'file') return []

    const lastIndex = tree.children.length - 1
    const lines = [`${tree.name}/`]

    for (const [i, entry] of tree.children.entries()) {
      if (entry.kind === 'file') {
        const prefix = i < lastIndex ? '├─' : '└─'
        lines.push(`${prefix} ${entry.name}`)
      } else {
        const innerLines = this._stringifyTreeRecursive(entry)
        for (const [j, line] of innerLines.entries()) {
          // prettier-ignore
          const innerPrefix =
            i < lastIndex
              ? (j === 0 ? '├─' : '│ ')
              : (j === 0 ? '└─' : '  ')
          lines.push(`${innerPrefix} ${line}`)
        }
      }
    }

    return lines
  }

  private async _dirByPath(
    directoryNames: string[],
    options: { create?: boolean } = {},
  ): Promise<FileSystemDirectoryHandle | undefined> {
    let currentEntry = this._entry

    for (const directoryName of directoryNames) {
      const entry = await getDirectoryHandleSafe(
        currentEntry,
        directoryName,
        options,
      )
      if (!entry) return undefined

      currentEntry = entry
    }

    return currentEntry
  }
}
