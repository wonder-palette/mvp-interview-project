# Dockerfile (最小のNode.jsランタイムイメージを使用)
FROM node:18-alpine

# 作業ディレクトリ作成
WORKDIR /app

# package.json, package-lock.jsonをコピー
COPY package*.json ./

# 依存パッケージインストール
RUN npm install

# ソースコードすべてをコピー (server.js, publicフォルダ等)
COPY . .

# 環境変数: Cloud Run上でポート指定
ENV PORT=8080

# Webサーバ起動時のコマンド
CMD ["npm", "start"]
