# web-fs

[![npm version](https://badge.fury.io/js/@vrcalphabet%2Fweb-fs.svg)](https://badge.fury.io/js/@vrcalphabet%2Fweb-fs)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

TypeScriptで書かれたFile System APIを簡単に操作するためのラッパーライブラリです。

## 例

### テキストファイルの読み込み

```typescript
import { pickFile } from "@vrcalphabet/web-fs";

const handle = await pickFile({
  types: [
    {
      description: "テキストファイル",
      accept: [".txt"],
    },
  ],
});

if (handle) {
  const content = await handle.text();
  console.log(content);
}
```

### ディレクトリ構造の表示

```typescript
import { pickDirectory } from "@vrcalphabet/web-fs";

const dirHandle = await pickDirectory();

if (dirHandle) {
  const tree = await dirHandle.treeString();
  console.log(tree);
}
```

### ファイルの作成と書き込み

```typescript
import { pickDirectory } from "@vrcalphabet/web-fs";

const dirHandle = await pickDirectory({ mode: "readwrite" });

if (dirHandle) {
  const fileHandle = await dirHandle.createFile("example.txt");
  if (fileHandle) {
    await fileHandle.write("Hello, World!");
  }
}
```

### Globパターンによる検索

```typescript
import { pickDirectory } from "@vrcalphabet/web-fs";

const dirHandle = await pickDirectory();

if (dirHandle) {
  // srcディレクトリ以下のすべてのtsファイルを取得
  const files = await dirHandle.glob("src/**/*.ts");
  for (const file of files) {
    console.log((await file.info()).name);
  }
}
```

### ハンドルの永続化

```typescript
import { pickFile } from "@vrcalphabet/web-fs";

// IDを指定して永続化を有効にする
const handle = await pickFile({
  id: "my-text-file",
  persistence: true,
});

if (handle) {
  // 次回以降、同じIDを指定するとピッカーを表示せずにハンドルを取得可能
  console.log(await handle.text());
}
```

## インストール

### npm

```bash
npm install @vrcalphabet/web-fs
```

### yarn

```bash
yarn add @vrcalphabet/web-fs
```

### pnpm

```bash
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
