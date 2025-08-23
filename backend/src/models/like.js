const pool = require('../utils/database');

class Like {
  static async create({ userId, quoteId }) {
    try {
      const result = await pool.query(
        'INSERT INTO likes (user_id, quote_id) VALUES ($1, $2) RETURNING *',
        [userId, quoteId]
      );
      
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') { // unique_violation
        throw new Error('이미 좋아요를 눌렀습니다.');
      }
      throw error;
    }
  }
  
  static async delete({ userId, quoteId }) {
    const result = await pool.query(
      'DELETE FROM likes WHERE user_id = $1 AND quote_id = $2 RETURNING *',
      [userId, quoteId]
    );
    
    return result.rows[0] || null;
  }
  
  static async exists({ userId, quoteId }) {
    const result = await pool.query(
      'SELECT id FROM likes WHERE user_id = $1 AND quote_id = $2',
      [userId, quoteId]
    );
    
    return result.rows.length > 0;
  }
  
  static async getCountByQuoteId(quoteId) {
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM likes WHERE quote_id = $1',
      [quoteId]
    );
    
    return parseInt(result.rows[0].count);
  }
  
  static async getLikesByQuoteId(quoteId) {
    const result = await pool.query(
      'SELECT * FROM likes WHERE quote_id = $1',
      [quoteId]
    );
    
    return result.rows;
  }
  
  static async deleteAllLikes() {
    await pool.query('DELETE FROM likes');
  }
}

module.exports = Like;
