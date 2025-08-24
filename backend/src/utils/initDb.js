const fs = require('fs');
const path = require('path');
const pool = require('./database');

async function runMigration() {
  try {
    console.log('🔄 데이터베이스 마이그레이션 실행 중...');
    
    // 마이그레이션 SQL 실행
    const migrationSQL = `
      -- 기존 users 테이블에 새 컬럼 추가 (IF NOT EXISTS로 안전하게)
      ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token_expires TIMESTAMP WITH TIME ZONE;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_password_token VARCHAR(255);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_password_expires TIMESTAMP WITH TIME ZONE;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;

      -- 인덱스 생성 (IF NOT EXISTS로 안전하게)
      CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
      CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verification_token);
      CREATE INDEX IF NOT EXISTS idx_users_reset_password_token ON users(reset_password_token);
    `;
    
    await pool.query(migrationSQL);
    console.log('✅ 데이터베이스 마이그레이션이 성공적으로 완료되었습니다.');
    
  } catch (error) {
    console.error('❌ 데이터베이스 마이그레이션 실패:', error);
    throw error;
  }
}

async function initializeDatabase() {
  try {
    console.log('🔄 데이터베이스 초기화 중...');
    
    // 스키마 파일 읽기
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // 스키마 실행
    await pool.query(schema);
    
    console.log('✅ 데이터베이스 스키마가 성공적으로 생성되었습니다.');
    
    // 마이그레이션 실행
    await runMigration();
    
    // 테이블 존재 확인
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('📋 생성된 테이블들:');
    tables.rows.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });
    
    // users 테이블 컬럼 확인
    const columns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'users' AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    
    console.log('📋 users 테이블 컬럼들:');
    columns.rows.forEach(column => {
      console.log(`  - ${column.column_name} (${column.data_type}, nullable: ${column.is_nullable})`);
    });
    
  } catch (error) {
    console.error('❌ 데이터베이스 초기화 실패:', error);
    throw error;
  }
}

// 스크립트가 직접 실행될 때만 초기화
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('🎉 데이터베이스 초기화 완료!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 데이터베이스 초기화 실패:', error);
      process.exit(1);
    });
}

module.exports = { initializeDatabase, runMigration };
