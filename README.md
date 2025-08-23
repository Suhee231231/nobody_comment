# 아무개의 명언

가장 보통의 존재들이 쓰는 하루 한마디

## 📱 앱 소개

일상적인 사람들의 말을 마치 위인의 명언처럼 격상시키는 소셜 플랫폼입니다.

### 주요 기능
- ✍️ 하루에 100자 이내 글 하나씩 작성
- 👍 다른 유저 글에 추천
- 🔄 매일 자정 자동 리셋
- 🔐 로그인/회원가입
- 📱 PWA 지원 (홈 화면 추가 가능)
- 💰 Google AdMob 광고

## 🛠 기술 스택

### Frontend
- React 18
- PWA (Progressive Web App)
- Tailwind CSS
- React Router

### Backend
- Node.js
- Express.js
- PostgreSQL (Railway)
- JWT 인증

### 배포
- Railway (Pro 계정 활용)

## 🚀 개발 시작

### 1. 의존성 설치
```bash
npm run install:all
```

### 2. 환경 변수 설정
```bash
# backend/.env
DATABASE_URL=your_railway_postgresql_url
JWT_SECRET=your_jwt_secret
PORT=3001

# frontend/.env
REACT_APP_API_URL=http://localhost:3001
```

### 3. 개발 서버 실행
```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## 📁 프로젝트 구조

```
nobody_comment/
├── frontend/                 # React PWA 앱
│   ├── public/
│   │   ├── manifest.json    # PWA 설정
│   │   └── icons/          # 앱 아이콘들
│   ├── src/
│   │   ├── components/      # UI 컴포넌트
│   │   ├── pages/          # 페이지 컴포넌트
│   │   ├── services/       # API 서비스
│   │   ├── hooks/          # 커스텀 훅
│   │   └── utils/          # 유틸리티
│   └── package.json
├── backend/                 # Express API 서버
│   ├── src/
│   │   ├── routes/         # API 라우트
│   │   ├── models/         # 데이터 모델
│   │   ├── middleware/     # 미들웨어
│   │   └── utils/          # 유틸리티
│   └── package.json
└── README.md
```

## 🚀 배포

Railway를 통해 자동 배포됩니다.

1. Railway 프로젝트 연결
2. 환경 변수 설정
3. 자동 배포 완료

## 📝 개발 가이드

### 새로운 기능 추가
1. Backend API 엔드포인트 작성
2. Frontend 컴포넌트 구현
3. API 연동
4. 테스트

### PWA 기능
- Service Worker 없이 기본 PWA 구현
- manifest.json으로 앱 설정
- 홈 화면 추가 가능

## �� 라이선스

MIT License
