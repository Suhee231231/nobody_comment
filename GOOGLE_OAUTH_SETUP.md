# Google OAuth 설정 가이드

## 1. Google Cloud Console 설정

### 1.1 프로젝트 생성
1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택

### 1.2 OAuth 2.0 클라이언트 ID 생성
1. **API 및 서비스** > **사용자 인증 정보**로 이동
2. **사용자 인증 정보 만들기** > **OAuth 2.0 클라이언트 ID** 선택
3. 애플리케이션 유형: **웹 애플리케이션** 선택
4. 이름 입력 (예: "아무개의 명언")
5. 승인된 리디렉션 URI 추가:
   - 개발 환경: `http://localhost:3000`
   - 프로덕션 환경: `https://your-domain.com`

### 1.3 클라이언트 ID 및 시크릿 확인
- **클라이언트 ID**: `your-client-id.apps.googleusercontent.com`
- **클라이언트 시크릿**: `your-client-secret`

## 2. 환경 변수 설정

### 2.1 백엔드 환경 변수 (.env)
```env
# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000

# 이메일 설정 (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# 프론트엔드 URL
FRONTEND_URL=http://localhost:3000
```

### 2.2 프론트엔드 환경 변수 (.env)
```env
REACT_APP_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
REACT_APP_API_URL=http://localhost:3001
```

## 3. Gmail 앱 비밀번호 설정 (이메일 전송용)

### 3.1 2단계 인증 활성화
1. Google 계정 설정에서 **보안** > **2단계 인증** 활성화

### 3.2 앱 비밀번호 생성
1. **보안** > **앱 비밀번호**로 이동
2. **앱 선택** > **기타 (맞춤 이름)** 선택
3. 이름 입력 (예: "아무개의 명언")
4. 생성된 16자리 비밀번호를 `EMAIL_PASS`에 설정

## 4. Railway 배포 시 환경 변수 설정

### 4.1 Railway 대시보드에서 설정
1. 프로젝트 대시보드 > **Variables** 탭
2. 다음 환경 변수 추가:
   ```
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   GOOGLE_REDIRECT_URI=https://your-domain.com
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   FRONTEND_URL=https://your-domain.com
   ```

### 4.2 Vercel 배포 시 환경 변수 설정
1. Vercel 대시보드 > 프로젝트 설정 > **Environment Variables**
2. 다음 환경 변수 추가:
   ```
   REACT_APP_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   REACT_APP_API_URL=https://your-backend-url.railway.app
   ```

## 5. 데이터베이스 마이그레이션

### 5.1 스키마 업데이트
Railway PostgreSQL에서 다음 SQL 실행:
```sql
-- 기존 users 테이블에 새 컬럼 추가
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token_expires TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_password_token VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_password_expires TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verification_token);
CREATE INDEX IF NOT EXISTS idx_users_reset_password_token ON users(reset_password_token);
```

## 6. 테스트

### 6.1 로컬 테스트
1. 백엔드 서버 시작: `npm run dev:backend`
2. 프론트엔드 서버 시작: `npm run dev:frontend`
3. 회원가입/로그인 페이지에서 구글 로그인 버튼 테스트

### 6.2 배포 테스트
1. Railway와 Vercel에 배포
2. 프로덕션 환경에서 구글 로그인 테스트
3. 이메일 인증 테스트

## 7. 문제 해결

### 7.1 일반적인 오류
- **"Invalid client"**: 클라이언트 ID가 올바르지 않음
- **"Redirect URI mismatch"**: 승인된 리디렉션 URI 확인
- **"Email sending failed"**: Gmail 앱 비밀번호 확인

### 7.2 디버깅
- 브라우저 개발자 도구에서 네트워크 탭 확인
- 백엔드 로그 확인 (Railway 대시보드)
- Google Cloud Console에서 OAuth 동의 화면 설정 확인

## 8. 보안 고려사항

### 8.1 환경 변수 보안
- 클라이언트 시크릿은 절대 프론트엔드에 노출하지 않음
- 프로덕션 환경에서는 HTTPS 사용 필수
- 정기적으로 앱 비밀번호 갱신

### 8.2 OAuth 보안
- 승인된 도메인에서만 OAuth 사용
- 필요한 스코프만 요청 (email, profile)
- 사용자 동의 화면 설정 확인
