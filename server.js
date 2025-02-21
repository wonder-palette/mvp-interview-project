// server.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const { google } = require('googleapis');

// ------------------
// 1) Expressサーバ設定
// ------------------
const app = express();
const PORT = process.env.PORT || 3000;

// 静的ファイルを "public" フォルダから配信
app.use(express.static(path.join(__dirname, 'public')));

// ファイルアップロード用
const upload = multer({ storage: multer.memoryStorage() });

// ------------------
// 2) (オプション) Google Drive APIの設定例
//  実際にDriveへアップロードしたい場合は
//  サービスアカウント設定＆キー読み込みが必要です
// ------------------

const KEYFILE_PATH = path.join(__dirname, 'service-account-key.json');
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILE_PATH,
  scopes: SCOPES,
});
const driveService = google.drive({ version: 'v3', auth });


// ------------------
// 3) 動画ファイル受取API (MVP用のダミー実装)
// ------------------
app.post('/upload', upload.single('videoFile'), async (req, res) => {
  try {
    // ★ここではMVP簡易対応として、受け取った動画を
    //   実際には保存せずに成功レスポンスを返す例
    //   もしGoogle Driveへアップロードしたいなら
    //   下記の "driveService.files.create" を利用してください。

     const fileBuffer = req.file.buffer;
     const fileName = req.file.originalname;
     const response = await driveService.files.create({
       requestBody: {
         name: fileName,
          parents: ['1NBXkOqsHOT0_uyiVYBlqpX1KdUMlAKNk']
       },
       media: {
         mimeType: req.file.mimetype,
         body: Buffer.from(fileBuffer)
       }
     });

     console.log('Uploaded File ID:', response.data.id);

    console.log('Received file:', req.file.originalname, req.file.size, 'bytes');

    return res.status(200).json({ message: 'Upload successful (dummy)' });
  } catch (error) {
    console.error('Error in /upload:', error);
    return res.status(500).json({ message: 'Upload failed' });
  }
});

// ------------------
// 4) サーバ起動
// ------------------
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
