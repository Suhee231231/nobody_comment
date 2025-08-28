const Quote = require('../models/quote');
const Like = require('../models/like');
const pool = require('./database');

class Scheduler {
  constructor() {
    this.isRunning = false;
  }

  // 매일 자정에 실행되는 작업
  scheduleDailyReset() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();
    
    console.log(`⏰ 다음 자정 리셋까지 ${Math.floor(timeUntilMidnight / 1000 / 60)}분 남았습니다.`);
    
    setTimeout(() => {
      this.performDailyReset();
      // 다음날부터는 24시간마다 실행
      setInterval(() => {
        this.performDailyReset();
      }, 24 * 60 * 60 * 1000);
    }, timeUntilMidnight);
  }

  async performDailyReset() {
    if (this.isRunning) {
      console.log('🔄 이미 리셋 작업이 실행 중입니다.');
      return;
    }

    this.isRunning = true;
    const client = await pool.connect();
    
    try {
      console.log('🔄 매일 자정 리셋을 시작합니다...');
      
      // 트랜잭션 시작
      await client.query('BEGIN');
      
      // 배치 크기 설정 (메모리 효율성을 위해)
      const batchSize = 1000;
      
      // 좋아요 삭제 (배치 처리)
      let deletedLikes = 0;
      do {
        const result = await client.query(
          'DELETE FROM likes WHERE id IN (SELECT id FROM likes LIMIT $1) RETURNING id',
          [batchSize]
        );
        deletedLikes = result.rows.length;
        console.log(`✅ 좋아요 ${deletedLikes}개 삭제됨`);
      } while (deletedLikes === batchSize);
      
      // 명언 삭제 (배치 처리)
      let deletedQuotes = 0;
      do {
        const result = await client.query(
          'DELETE FROM quotes WHERE id IN (SELECT id FROM quotes LIMIT $1) RETURNING id',
          [batchSize]
        );
        deletedQuotes = result.rows.length;
        console.log(`✅ 명언 ${deletedQuotes}개 삭제됨`);
      } while (deletedQuotes === batchSize);
      
      // 트랜잭션 커밋
      await client.query('COMMIT');
      
      console.log('🎉 매일 자정 리셋이 완료되었습니다!');
      
    } catch (error) {
      // 트랜잭션 롤백
      await client.query('ROLLBACK');
      console.error('❌ 자정 리셋 중 오류 발생:', error);
    } finally {
      client.release();
      this.isRunning = false;
    }
  }

  // 수동 리셋 (테스트용)
  async manualReset() {
    console.log('🔄 수동 리셋을 시작합니다...');
    await this.performDailyReset();
  }
}

module.exports = new Scheduler();
