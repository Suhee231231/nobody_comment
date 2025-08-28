const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const quoteRoutes = require('./routes/quotes');
const adminRoutes = require('./routes/admin');
const { initializeDatabase, runMigration } = require('./utils/initDb');
// const scheduler = require('./utils/scheduler');

const app = express();
const PORT = process.env.PORT || 3001;

// 미들웨어
app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'https://nobody-comment.vercel.app'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 헬스 체크
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API 라우트
app.use('/auth', authRoutes);
app.use('/quotes', quoteRoutes);
app.use('/admin', adminRoutes);

// API 전용 서버 - 프론트엔드는 Vercel에서 서빙
app.get('*', (req, res) => {
  res.status(404).json({ message: '요청한 리소스를 찾을 수 없습니다.' });
});

// 에러 핸들러
app.use((error, req, res, next) => {
  console.error('서버 오류:', error);
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({ message: error.message });
  }
  
  if (error.name === 'UnauthorizedError') {
    return res.status(401).json({ message: '인증이 필요합니다.' });
  }
  
  res.status(500).json({ message: '서버 내부 오류가 발생했습니다.' });
});

// 서버 시작
app.listen(PORT, async () => {
  console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`📱 환경: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 API URL: http://localhost:${PORT}`);
  
  // 데이터베이스 초기화 및 마이그레이션
  try {
    await initializeDatabase();
    console.log('✅ 데이터베이스 초기화 및 마이그레이션 완료');
  } catch (error) {
    console.error('❌ 데이터베이스 초기화 실패:', error);
    // 마이그레이션만 시도
    try {
      await runMigration();
      console.log('✅ 데이터베이스 마이그레이션 완료');
    } catch (migrationError) {
      console.error('❌ 마이그레이션 실패:', migrationError);
    }
  }
  
  console.log('🚀 API 전용 서버가 실행 중입니다.');
  console.log('🌐 프론트엔드는 Vercel에서 서빙됩니다.');
  
  // 자정 리셋 스케줄러 시작
  scheduler.scheduleDailyReset();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM 신호를 받았습니다. 서버를 종료합니다...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT 신호를 받았습니다. 서버를 종료합니다...');
  process.exit(0);
});

module.exports = app;
