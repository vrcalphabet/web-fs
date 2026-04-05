import { FileSystemEntry } from '../types/entry'

/**
 * ハンドルから読み書き権限が取得できなかったことを示すクラスです。
 */
export class WebFsPermissionDenied {
  private _handle: FileSystemEntry

  /**
   * 関連付けられたハンドルです。
   */
  get handle() {
    return this._handle
  }

  constructor(handle: FileSystemEntry) {
    this._handle = handle
  }
}
