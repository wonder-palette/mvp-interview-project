// main.js
const startBtn = document.getElementById('startBtn');
const stopBtn  = document.getElementById('stopBtn');
const avatarMouth = document.querySelector('.avatar-mouth');
const candidateVideo = document.querySelector('.candidate-video');

// 録画用変数
let mediaRecorder;
let recordedChunks = [];
let stream = null;

// 面接開始
startBtn.addEventListener('click', async () => {
  // 1) カメラ映像を取得
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    candidateVideo.srcObject = stream;
  } catch (err) {
    console.error('Camera/Mic permission error:', err);
    alert('カメラ・マイクへのアクセスが許可されていません。');
    return;
  }

  // 2) MediaRecorderで録画準備
  recordedChunks = [];
  mediaRecorder = new MediaRecorder(stream);
  
  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) {
      recordedChunks.push(e.data);
    }
  };
  
  mediaRecorder.onstop = () => {
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    uploadRecordedVideo(blob);
  };

  mediaRecorder.start();

  // 3) 固定質問を読み上げ + 口パク開始
  speakWithMouth("こんにちは。本日は簡単な自己紹介をお願いいたします。");

  // UIの切り替え
  startBtn.disabled = true;
  stopBtn.disabled = false;
});

// 面接終了
stopBtn.addEventListener('click', () => {
  // 録画停止
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
  }
  // カメラストリーム停止
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
  
  startBtn.disabled = false;
  stopBtn.disabled = true;
});

// TTS + 口パクアニメ
function speakWithMouth(text) {
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'ja-JP';

  utter.onstart = () => {
    avatarMouth.style.display = 'block'; // 口パクON
  };
  utter.onend = () => {
    avatarMouth.style.display = 'none'; // 口パクOFF
  };

  speechSynthesis.speak(utter);
}

// 録画データのサーバアップロード
async function uploadRecordedVideo(blob) {
  const formData = new FormData();
  formData.append('videoFile', blob, 'candidateInterview.webm');
  
  try {
    const response = await fetch('/upload', {
      method: 'POST',
      body: formData
    });
    if (response.ok) {
      alert('動画をアップロードしました！');
    } else {
      alert('動画のアップロードに失敗しました。');
    }
  } catch (err) {
    console.error(err);
    alert('アップロード中にエラーが発生しました。');
  }
}
