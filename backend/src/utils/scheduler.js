const Quote = require('../models/quote');
const Like = require('../models/like');

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
    
    try {
      console.log('🔄 매일 자정 리셋을 시작합니다...');
      
      // 좋아요 삭제
      await Like.deleteAllLikes();
      console.log('✅ 모든 좋아요가 삭제되었습니다.');
      
      // 명언 삭제
      await Quote.deleteAllQuotes();
      console.log('✅ 모든 명언이 삭제되었습니다.');
      
      console.log('🎉 매일 자정 리셋이 완료되었습니다!');
      
    } catch (error) {
      console.error('❌ 자정 리셋 중 오류 발생:', error);
    } finally {
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
