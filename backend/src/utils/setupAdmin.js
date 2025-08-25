const bcrypt = require('bcryptjs');
const pool = require('./database');

async function setupAdmin() {
  try {
    console.log('🔧 관리자 설정을 시작합니다...');

    // 관리자 권한 컬럼 추가
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
    `);
    console.log('✅ 관리자 권한 컬럼 추가 완료');

    // 관리자 인덱스 생성
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin);
    `);
    console.log('✅ 관리자 인덱스 생성 완료');

    // 관리자 비밀번호 해시화
    const adminPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    // 관리자 계정 생성 또는 업데이트
    const result = await pool.query(`
      INSERT INTO users (username, email, password_hash, email_verified, is_admin, terms_agreed, privacy_agreed, terms_agreed_at, privacy_agreed_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      ON CONFLICT (email) DO UPDATE SET
        is_admin = TRUE,
        email_verified = TRUE,
        terms_agreed = TRUE,
        privacy_agreed = TRUE,
        terms_agreed_at = NOW(),
        privacy_agreed_at = NOW()
      RETURNING id, username, email, is_admin;
    `, [
      'admin',
      'admin@nobody-comment.com',
      hashedPassword,
      true,
      true,
      true,
      true
    ]);

    console.log('✅ 관리자 계정 설정 완료');
    console.log('📧 관리자 계정 정보:');
    console.log(`   이메일: admin@nobody-comment.com`);
    console.log(`   비밀번호: ${adminPassword}`);
    console.log(`   사용자명: ${result.rows[0].username}`);
    console.log(`   관리자 권한: ${result.rows[0].is_admin ? '예' : '아니오'}`);

  } catch (error) {
    console.error('❌ 관리자 설정 실패:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// 스크립트가 직접 실행될 때만 실행
if (require.main === module) {
  setupAdmin()
    .then(() => {
      console.log('🎉 관리자 설정이 완료되었습니다!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 관리자 설정 실패:', error);
      process.exit(1);
    });
}

module.exports = setupAdmin;
