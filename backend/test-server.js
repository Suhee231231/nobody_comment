const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// 미들웨어
app.use(cors());
app.use(express.json());

// 테스트 라우트
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: '서버가 정상적으로 실행 중입니다.',
    timestamp: new Date().toISOString()
  });
});

app.get('/test', (req, res) => {
  res.json({ message: '테스트 성공!' });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 테스트 서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`🌐 API URL: http://localhost:${PORT}`);
});
