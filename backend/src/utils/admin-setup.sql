-- 관리자 권한 컬럼 추가
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- 관리자 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin);

-- 관리자 계정 생성 (비밀번호: admin123)
-- bcrypt로 해시화된 비밀번호 (admin123)
INSERT INTO users (username, email, password_hash, email_verified, is_admin, terms_agreed, privacy_agreed, terms_agreed_at, privacy_agreed_at)
VALUES (
  'admin',
  'admin@nobody-comment.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8J8K8K8',
  TRUE,
  TRUE,
  TRUE,
  TRUE,
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  is_admin = TRUE,
  email_verified = TRUE,
  terms_agreed = TRUE,
  privacy_agreed = TRUE,
  terms_agreed_at = NOW(),
  privacy_agreed_at = NOW();
