# web-fs

[![npm version](https://badge.fury.io/js/@vrcalphabet%2Fweb-fs.svg)](https://badge.fury.io/js/@vrcalphabet%2Fweb-fs)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

TypeScriptで書かれたFile System APIを簡単に操作するためのラッパーライブラリです。

## 例

### テキストファイルの読み込み

```typescript
import { isHandle, pickFile } from '@vrcalphabet/web-fs'

const handle = await pickFile({
  types: [
    {
      description: 'テキストファイル',
      accept: ['.txt'],
    },
  ],
})

if (isHandle(handle)) {
  const content = await handle.text()
  console.log(content)
}
```

### ディレクトリ構造の表示

```typescript
import { isHandle, pickDirectory } from '@vrcalphabet/web-fs'

const dirHandle = await pickDirectory()

if (isHandle(dirHandle)) {
  const tree = await dirHandle.stringifyTree()
  console.log(tree)
}
```

### ファイルの作成と書き込み

```typescript
import { isHandle, pickDirectory } from '@vrcalphabet/web-fs'

const dirHandle = await pickDirectory({ mode: 'readwrite' })

if (isHandle(dirHandle)) {
  const fileHandle = await dirHandle.createFile('example.txt')
  if (fileHandle) {
    await fileHandle.write('Hello, World!')
  }
}
```

### Globパターンによる検索

```typescript
import { isHandle, pickDirectory } from '@vrcalphabet/web-fs'

const dirHandle = await pickDirectory()

if (isHandle(dirHandle)) {
  // srcディレクトリ以下のすべてのtsファイルを取得
  const files = await dirHandle.glob('src/**/*.ts')
  for (const file of files) {
    console.log((await file.info()).size)
  }
}
```

### ハンドルの永続化

```typescript
import { isHandle, pickFile } from '@vrcalphabet/web-fs'

// IDを指定して永続化を有効にする
const handle = await pickFile({
  id: 'my-text-file',
  persistence: true,
})

if (isHandle(handle)) {
  // 次回以降、同じIDを指定するとピッカーを表示せずにハンドルを取得可能
  console.log(await handle.text())
}
```

## インストール

```bash
npm install @vrcalphabet/web-fs
# or
yarn add @vrcalphabet/web-fs
# or
pnpm add @vrcalphabet/web-fs
```

## 貢献

プロジェクトへの貢献を歓迎します！以下のルールに従うと，あなたの貢献がスムーズになります！

### Issue / PR

Issueを立てる際は，バグ報告・機能要望のどちらかを明記してください。
PRの説明には，目的・変更点・影響範囲・サンプルコードがあるとありがたいです。

## ライセンス

MIT License

詳細は[LICENSE](./LICENSE)ファイルを参照してください。

## 変更履歴・リリース情報

### v1.0.0 (2026-02-02)

- 初回リリース

### v2.0.0 (2026-04-05)

- `glob()` の修正 (`web-fs-glob` によるglobパターンでのファイル検索に移行)
- `isHandle()` / `filterHandle()` の追加 (型ガードユーティリティ)
- `hash()` のアルゴリズムを追加 (`md5`、`sha1`、`sha256`、`sha384`、`sha512`)
- `WebFsFileInfo` に `lastModifiedDate` (`Date`型) を追加
- `treeString()` を `stringifyTree()` にリネーム
