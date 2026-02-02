import {
  WebFsDirectoryPickOptions,
  WebFsFilePickOptions,
  WebFsPermissionOptions,
} from "./types";
import { WebFsDirectoryHandle } from "./WebFsDirectoryHandle";
import { WebFsFileHandle } from "./WebFsFileHandle";
import { HandleStore } from "./services/HandleStore";
import { WebFsFileHandleList } from "./WebFsFileHandleList";

export * from "./types";
export * from "./WebFsHandle";
export * from "./WebFsFileHandle";
export * from "./WebFsDirectoryHandle";

/**
 * ブラウザが`web-fs`に対応しているかを確認します。\
 * 値として`false`が返った場合は、その他の関数や`WebFs*`クラスを使用できません。
 *
 * @returns 対応している場合は`true`、そうでない場合は`false`。
 */
export function supportsWebFs(): boolean {
  return (
    globalThis.isSecureContext &&
    "showOpenFilePicker" in globalThis &&
    "showDirectoryPicker" in globalThis
  );
}

/**
 * ユーザに単一のファイルを選択させ、そのファイルを`WebFsFileHandle`でラップしたものを返します。
 *
 * @param options ファイル選択のオプション。
 * @returns 成功した場合は`WebFsFileHandle`、選択を取り消した場合やエラーが出た場合は`undefined`。
 */
export async function pickFile(
  options: WebFsFilePickOptions = {},
): Promise<WebFsFileHandle | undefined> {
  try {
    if (options.persistence === true) {
      const fileHandle = await HandleStore.getFile(options.id);

      if (fileHandle) {
        return await WebFsFileHandle.create(fileHandle[0], options.mode);
      }
    }

    const fileHandle = await openFilePicker(options, false);
    if (options.persistence === true) {
      HandleStore.setFile(options.id, fileHandle);
    }

    return await WebFsFileHandle.create(fileHandle[0], options.mode);
  } catch {
    return undefined;
  }
}

/**
 * ユーザに複数のファイルを選択させ、そのファイルリストを`WebFsFileHandleList`でラップしたものを返します。
 *
 * @param options ファイル選択のオプション。
 * @returns 成功した場合は`WebFsFileHandleList`、選択を取り消した場合やエラーが出た場合は`undefined`。
 */
export async function pickFiles(
  options: WebFsFilePickOptions = {},
): Promise<WebFsFileHandleList | undefined> {
  try {
    if (options.persistence === true) {
      const fileListHandle = await HandleStore.getFile(options.id);

      if (fileListHandle) {
        return await WebFsFileHandleList.create(fileListHandle, options.mode);
      }
    }

    const fileListHandle = await openFilePicker(options, true);
    if (options.persistence === true) {
      HandleStore.setFile(options.id, fileListHandle);
    }

    return await WebFsFileHandleList.create(fileListHandle, options.mode);
  } catch {
    return undefined;
  }
}

/**
 * ユーザに単一のディレクトリを選択させ、そのディレクトリを`WebFsDirectoryHandle`でラップしたものを返します。
 *
 * @param options ディレクトリ選択のオプション。
 * @returns 成功した場合は`WebFsDirectoryHandle`、選択を取り消した場合やエラーが出た場合は`undefined`。
 */
export async function pickDirectory(
  options: WebFsDirectoryPickOptions = {},
): Promise<WebFsDirectoryHandle | undefined> {
  try {
    if (options.persistence === true) {
      const directoryHandle = await HandleStore.getDirectory(options.id);

      if (directoryHandle) {
        return await WebFsDirectoryHandle.create(directoryHandle, options.mode);
      }
    }

    const directoryHandle = await globalThis.showDirectoryPicker({
      id: `web-fs_${options.id}`,
      startIn: options.startIn,
    });

    if (options.persistence === true) {
      HandleStore.setDirectory(options.id, directoryHandle);
    }

    return await WebFsDirectoryHandle.create(directoryHandle, options.mode);
  } catch {
    return undefined;
  }
}

/**
 * ファイルを`WebFsFileHandle`でラップしたものを返します。
 *
 * @param fileHandle すでに取得しているファイルハンドル。
 * @param options ファイルのオプション。
 * @returns 成功した場合は`WebFsFileHandle`、エラーが出た場合は`undefined`。
 */
export async function mountFile(
  fileHandle: FileSystemFileHandle,
  options: WebFsPermissionOptions = {},
): Promise<WebFsFileHandle | undefined> {
  try {
    const webFsFileHandle = await WebFsFileHandle.create(
      fileHandle,
      options.mode,
    );
    return webFsFileHandle;
  } catch {
    return undefined;
  }
}

/**
 * ディレクトリを`WebFsDirectoryHandle`でラップしたものを返します。
 *
 * @param directoryHandle すでに取得しているディレクトリハンドル。
 * @param options ディレクトリのオプション。
 * @returns 成功した場合は`WebFsDirectoryHandle`、エラーが出た場合は`undefined`。
 */
export async function mountDirectory(
  directoryHandle: FileSystemDirectoryHandle,
  options: WebFsPermissionOptions = {},
): Promise<WebFsDirectoryHandle | undefined> {
  try {
    const webFsDirectoryHandle = await WebFsDirectoryHandle.create(
      directoryHandle,
      options.mode,
    );
    return webFsDirectoryHandle;
  } catch {
    return undefined;
  }
}

/**
 * 保存されたファイルハンドルを削除します。
 *
 * @param id 削除したいファイルハンドルのid。
 */
export async function unmountFile(id: string): Promise<void> {
  await HandleStore.delFile(id);
}

/**
 * 保存されたディレクトリハンドルを削除します。
 *
 * @param id 削除したいディレクトリハンドルのid。
 */
export async function unmountDirectory(id: string): Promise<void> {
  await HandleStore.delDirectory(id);
}

function openFilePicker(options: WebFsFilePickOptions, multiple: boolean) {
  return globalThis.showOpenFilePicker({
    id: `web-fs_${options.id}`,
    excludeAcceptAllOption: !options.acceptAllExtensions,
    startIn: options.startIn,
    multiple: multiple,
    types: options.types?.map(({ description, accept }) => ({
      description,
      accept: {
        "*/*": accept,
      },
    })),
  });
}
