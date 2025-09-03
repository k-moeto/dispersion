# Artience Weaver

## 1. プロジェクト概要 (Project Overview)

**Artience Weaver** は、化学メーカー「アーティエンス」のポリマー設計技術に着想を得た、Web上でインタラクティブな3Dアートを生成するジェネレーターです。ユーザーは「分子量」や「架橋密度」といった科学的なパラメータを操作することで、マテリアルの質感を「さらさら」から「ネバネバ」までダイナミックに変化させ、予測不能で美しい粒子ベースの3Dビジュアルをアート作品として創り出すことができます。

This is an interactive 3D art generator inspired by the polymer design technology of "Artience," a chemical manufacturer. Users can manipulate scientific parameters like "Molecular Weight" and "Cross-link Density" to dynamically change the texture of materials from "silky" to "slimy," creating unpredictable and beautiful particle-based 3D visuals.

## 2. コンセプト (Concept)

- **世界観 (Worldview):** 「デジタル上の化学実験室」 (A digital chemistry lab)
- **デザインテーマ (Design Theme):** サイエンティフィック、ギーク、ミニマル (Scientific, Geeky, Minimal)

## 3. 技術スタック (Technology Stack)

- **フロントエンド (Frontend):** Next.js (React)
- **3Dレンダリング (3D Rendering):** Three.js, @react-three/fiber, @react-three/drei
- **UIライブラリ (UI Library):** Material-UI (MUI)
- **言語 (Language):** TypeScript

## 4. 開発環境のセットアップ (Setup)

### 前提条件 (Prerequisites)

- [Node.js](https://nodejs.org/) (v18 or later)
- [npm](https://www.npmjs.com/)

### インストール (Installation)

1.  リポジトリをクローンします。
    ```bash
    git clone <repository-url>
    ```

2.  プロジェクトディレクトリに移動します。
    ```bash
    cd artience-weaver
    ```

3.  依存関係をインストールします。
    ```bash
    npm install
    ```

## 5. 開発サーバーの起動 (Running the Development Server)

以下のコマンドを実行して、開発サーバーを起動します。

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開くと、アプリケーションが表示されます。
