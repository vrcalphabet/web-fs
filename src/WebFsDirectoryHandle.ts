import { WebFsFileHandle } from './WebFsFileHandle'
import { WebFsHandle } from './WebFsHandle'
import {
  WebFsEntryListOptions,
  WebFsGetDirectoryOptions,
  WebFsGetFileOptions,
  WebFsPermissionOptions,
  WebFsTreeResult,
} from './types'
import micromatch from 'micromatch'
import path from 'node:path'

type FilterType = 'none' | 'file' | 'dir' | 'all'
type FilterReturnType = {
  none: never[]
  file: FileSystemFileHandle[]
  dir: FileSystemDirectoryHandle[]
  all: FileSystemHandle[]
}

function toFilterType(file: boolean, dir: boolean): FilterType {
  if (file && dir) return 'all'
  if (!file && !dir) return 'none'
  return file ? 'file' : 'dir'
}

export class WebFsDirectoryHandle extends WebFsHandle {
  /**
   * ディレクトリハンドルの種類。常に`"directory"`を返します。
   */
  readonly type = 'directory'
  protected _handle

  private constructor(handle: FileSystemDirectoryHandle) {
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
    handle: FileSystemDirectoryHandle,
    mode: FileSystemPermissionMode = 'read',
  ): Promise<WebFsDirectoryHandle | undefined> {
    const instance = new this(handle)
    const verified = await instance._verifyPermission(mode)
    if (!verified) return undefined

    return instance
  }

  /**
   * ファイルを取得します。ファイル名またはファイルの相対パスを指定します。
   *
   * @param filePath 取得するファイルのファイルパス。
   * @param options ファイルのオプション。
   * @returns ファイルが取得できた場合は`WebFsFileHandle`、`options.create`が`false`かつファイルが存在しない場合、またはエラーが出た場合は`undefined`。
   */
  async file(
    filePath: string,
    options?: WebFsGetFileOptions,
  ): Promise<WebFsFileHandle | undefined> {
    try {
      const directoryNames = path.resolve(filePath).split(path.sep).slice(1)
      const fileName = directoryNames.pop()!

      if (fileName === '') {
        return undefined
      }

      const dirHandle = await this._dirByPath(directoryNames, options?.create)
      const fileHandle = await dirHandle.getFileHandle(fileName, {
        create: options?.create,
      })
      const webFsFileHandle = await WebFsFileHandle.create(fileHandle, options?.mode)

      return webFsFileHandle
    } catch {
      return undefined
    }
  }

  /**
   * ディレクトリを取得します。ディレクトリ名またはディレクトリの相対パスで指定します。
   *
   * @param dirPath 取得するディレクトリのファイルパス。
   * @param options ディレクトリのオプション。
   * @returns ディレクトリが取得できた場合は`WebFsDirectoryHandle`、`options.create`が`false`かつディレクトリが存在しない場合、またはエラーが出た場合は`undefined`。
   */
  async dir(
    dirPath: string,
    options?: WebFsGetDirectoryOptions,
  ): Promise<WebFsDirectoryHandle | undefined> {
    try {
      const directoryNames = path.resolve(dirPath).split(path.sep).slice(1)

      if (directoryNames.length === 1 && directoryNames[0] === '') {
        return undefined
      }

      const dirHandle = await this._dirByPath(directoryNames, options?.create)
      const webFsDirectoryHandle = await WebFsDirectoryHandle.create(
        dirHandle,
        options?.mode,
      )

      return webFsDirectoryHandle
    } catch {
      return undefined
    }
  }

  /**
   * ファイルを簡易的なglobパターンから取得します。
   *
   * @returns globパターンにマッチしたファイルの`WebFsFileHandle`の配列。
   */
  async glob(pattern: string): Promise<WebFsFileHandle[]> {
    if (pattern === '') {
      return []
    }

    const patterns = pattern.split('/')
    const entries = await this._glob(patterns)
    const result = entries.map((entry) =>
      WebFsFileHandle.create(entry as FileSystemFileHandle),
    )

    return (await Promise.all(result)).filter((entry) => entry !== undefined)
  }

  private async _glob(
    patterns: string[],
    patternIndex: number = 0,
    cd: FileSystemDirectoryHandle = this._handle,
    path: string = '',
  ): Promise<FileSystemFileHandle[]> {
    const result: FileSystemFileHandle[] = []
    const entries = await Array.fromAsync(cd.values())

    const currentPattern = patterns[patternIndex]
    const isLast = patternIndex === patterns.length - 1

    const dirs = this._filterEntry('dir', entries)
    const files = this._filterEntry('file', entries)

    if (isLast) {
      const matchedFiles = files.filter((entry) =>
        micromatch.isMatch(path + entry.name, patterns.join('/')),
      )
      return matchedFiles
    }

    if (currentPattern === '**') {
      const files = await this._glob(patterns, patterns.length - 1, cd, path)
      result.push(...files)

      for (const dir of dirs) {
        const files = await this._glob(
          patterns,
          patternIndex,
          dir,
          `${path}${dir.name}/`,
        )
        result.push(...files)
      }
    } else {
      const matchedDirs = dirs.filter((entry) =>
        micromatch.isMatch(entry.name, patterns[patternIndex]),
      )

      for (const dir of matchedDirs) {
        const files = await this._glob(
          patterns,
          patternIndex + 1,
          dir,
          `${path}${dir.name}/`,
        )
        result.push(...files)
      }
    }

    return result
  }

  /**
   * ファイルを作成します。ファイル名またはファイルの相対パスで指定します。
   *
   * @returns ファイルが作成できた場合はそのファイルの`WebFsFileHandle`、エラーが出た場合は`undefined`。
   */
  async createFile(
    filePath: string,
    options?: WebFsPermissionOptions,
  ): Promise<WebFsFileHandle | undefined> {
    return await this.file(filePath, { ...options, create: true })
  }

  /**
   * ディレクトリを作成します。ディレクトリ名またはディレクトリの相対パスで指定します。
   *
   * @returns ディレクトリが作成できた場合はそのディレクトリの`WebFsDirectoryHandle`、エラーが出た場合は`undefined`。
   */
  async createDir(
    dirPath: string,
    options?: WebFsPermissionOptions,
  ): Promise<WebFsDirectoryHandle | undefined> {
    return await this.dir(dirPath, { ...options, create: true })
  }

  /**
   * ファイルまたはディレクトリを削除します。削除するエントリーがディレクトリであった場合は、その子孫を再帰的に削除します。
   *
   * @param entryPath 削除するファイルまたはディレクトリの名前。
   * @returns 削除に成功した場合は`true`、エントリーが存在しないまたはエラーの場合は`false`。
   */
  async remove(entryPath: string): Promise<boolean> {
    try {
      const entryNames = path.resolve(entryPath).split(path.sep).slice(1)
      const lastEntryName = entryNames.pop()!

      if (lastEntryName === '') {
        return false
      }

      const dirHandle = await this._dirByPath(entryNames)
      await dirHandle.removeEntry(entryPath, { recursive: true })
      return true
    } catch {
      return false
    }
  }

  /**
   * 現在の階層にあるファイル名またはディレクトリ名の一覧を取得します。
   *
   * @param [options={}] 一覧のオプション。
   * @returns ファイル名またはディレクトリ名からなる配列を返します。
   */
  async names({
    file = true,
    dir = true,
    depth = 1,
  }: WebFsEntryListOptions = {}): Promise<string[]> {
    if (!file && !dir) {
      return []
    }

    const tree = await this._tree(toFilterType(file, dir), depth)
    return this._flat(tree).map((entry) => entry.name)
  }

  /**
   * 現在の階層にあるファイルまたはディレクトリのハンドルの一覧を取得します。
   *
   * @param [options={}] 一覧のオプション。
   * @returns ファイルハンドルまたはディレクトリハンドルからなる配列を返します。
   */
  async list({
    file = true,
    dir = true,
    depth = 1,
  }: WebFsEntryListOptions = {}): Promise<
    (WebFsFileHandle | WebFsDirectoryHandle)[]
  > {
    if (!file && !dir) {
      return []
    }

    const tree = await this._tree(toFilterType(file, dir), depth)
    const entries = this._flat(tree).map((entry) =>
      entry.kind === 'file' ?
        WebFsFileHandle.create(entry as FileSystemFileHandle)
      : WebFsDirectoryHandle.create(entry as FileSystemDirectoryHandle),
    )
    return (await Promise.all(entries)).filter((entry) => !!entry)
  }

  /**
   * ファイル構造をツリー形式として取得します。
   *
   * @returns ツリー形式のオブジェクト。
   */
  async tree({
    file = true,
    dir = true,
    depth = 1,
  }: WebFsEntryListOptions = {}): Promise<WebFsTreeResult> {
    const treeResult = await this._tree(toFilterType(file, dir), depth)
    return {
      handle: this._handle,
      children: treeResult,
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
  async treeString({
    file = true,
    dir = true,
    depth = 1,
  }: WebFsEntryListOptions = {}): Promise<string> {
    const lines = await this._toString(toFilterType(file, dir), depth)
    return lines.join('\n')
  }

  private async _tree(
    type: FilterType,
    maxDepth: number,
    depth: number = 1,
    cd: FileSystemDirectoryHandle = this._handle,
  ): Promise<WebFsTreeResult[]> {
    if (type === 'none') {
      return []
    }

    const entries = await Array.fromAsync(cd.values())
    const filteredEntries = this._filterEntry(type, entries)

    const list: WebFsTreeResult[] = []
    for (const entry of filteredEntries) {
      if (entry.kind === 'file' || depth === maxDepth) {
        list.push({
          handle: entry as FileSystemFileHandle,
          children: undefined,
        })
      } else {
        const tre = await this._tree(
          type,
          maxDepth,
          depth + 1,
          entry as FileSystemDirectoryHandle,
        )
        list.push({
          handle: entry as FileSystemDirectoryHandle,
          children: tre,
        })
      }
    }

    return list
  }

  private _flat(tree: WebFsTreeResult[]): FileSystemHandle[] {
    const result: FileSystemHandle[] = []

    for (const { handle, children } of tree) {
      result.push(handle)

      if (children) {
        result.push(...this._flat(children))
      }
    }

    return result
  }

  private async _toString(
    type: FilterType,
    maxDepth: number,
    depth: number = 1,
    cd: FileSystemDirectoryHandle = this._handle,
  ): Promise<string[]> {
    if (type === 'none') {
      return [`${cd.name}/`]
    }

    const entries = await Array.fromAsync(cd.values())
    const filteredEntries = this._filterEntry(type, entries)
    const lastIndex = filteredEntries.length - 1

    const lines = []
    lines.push(`${cd.name}/`)

    for (const [index, entry] of filteredEntries.entries()) {
      let prefix = index < lastIndex ? '├─' : '└─'

      if (entry.kind === 'file') {
        lines.push(`${prefix} ${entry.name}`)
      } else if (depth === maxDepth) {
        lines.push(`${prefix} ${entry.name}/`)
      } else {
        const innerLines = await this._toString(
          type,
          maxDepth,
          depth + 1,
          entry as FileSystemDirectoryHandle,
        )
        lines.push(
          ...innerLines.map((line, i) => {
            let prefix: string
            if (index === lastIndex) {
              prefix = i === 0 ? '└─' : '  '
            } else {
              prefix = i === 0 ? '├─' : '│ '
            }

            return `${prefix} ${line}`
          }),
        )
      }
    }

    return lines
  }

  private _filterEntry<T extends FilterType>(
    type: T,
    entries: FileSystemHandle[],
  ): FilterReturnType[T] {
    if (type === 'none') return []

    const result = entries.filter((entry) => {
      if (type === 'all') return true

      return type === 'file' ? entry.kind === 'file' : entry.kind === 'directory'
    })
    return result as FilterReturnType[T]
  }

  private async _dirByPath(directoryNames: string[], create: boolean = false) {
    let handle = this._handle
    for (const directoryName of directoryNames) {
      handle = await handle.getDirectoryHandle(directoryName, {
        create,
      })
    }

    return handle
  }
}
