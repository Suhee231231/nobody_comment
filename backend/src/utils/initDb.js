const fs = require('fs');
const path = require('path');
const pool = require('./database');

async function initializeDatabase() {
  try {
    console.log('🔄 데이터베이스 초기화 중...');
    
    // 스키마 파일 읽기
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // 스키마 실행
    await pool.query(schema);
    
    console.log('✅ 데이터베이스 스키마가 성공적으로 생성되었습니다.');
    
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

module.exports = initializeDatabase;
