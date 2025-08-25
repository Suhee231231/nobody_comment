const pool = require('../utils/database');

class Quote {
  static async create({ content, authorId }) {
    const result = await pool.query(
      'INSERT INTO quotes (content, author_id) VALUES ($1, $2) RETURNING *',
      [content, authorId]
    );
    
    return result.rows[0];
  }
  
  static async findById(id) {
    const result = await pool.query(
      `SELECT q.*, u.username as author_username 
       FROM quotes q 
       JOIN users u ON q.author_id = u.id 
       WHERE q.id = $1`,
      [id]
    );
    
    return result.rows[0] || null;
  }
  
  static async findByAuthorId(authorId, date = null) {
    let query = `
      SELECT q.*, u.username as author_username 
      FROM quotes q 
      JOIN users u ON q.author_id = u.id 
      WHERE q.author_id = $1
    `;
    
    const params = [authorId];
    
    if (date) {
      query += ` AND DATE(q.created_at) = DATE($2)`;
      params.push(date);
    }
    
    query += ` ORDER BY q.created_at DESC`;
    
    const result = await pool.query(query, params);
    return result.rows[0] || null;
  }
  
  static async findAll(page = 1, limit = 10, userId = null) {
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT 
        q.*,
        u.username as author_username,
        COUNT(l.id) as likes_count,
        ${userId ? 'EXISTS(SELECT 1 FROM likes WHERE user_id = $3 AND quote_id = q.id) as is_liked' : 'false as is_liked'}
      FROM quotes q 
      JOIN users u ON q.author_id = u.id 
      LEFT JOIN likes l ON q.id = l.quote_id
    `;
    
    const params = [limit, offset];
    if (userId) params.push(userId);
    
    query += `
      GROUP BY q.id, u.username
      ORDER BY q.created_at DESC 
      LIMIT $1 OFFSET $2
    `;
    
    const result = await pool.query(query, params);
    
    // 전체 개수 조회
    const countResult = await pool.query('SELECT COUNT(*) FROM quotes');
    const total = parseInt(countResult.rows[0].count);
    
    return {
      quotes: result.rows,
      total,
      hasMore: offset + limit < total
    };
  }
  
  static async update(id, { content }) {
    const result = await pool.query(
      'UPDATE quotes SET content = $1 WHERE id = $2 RETURNING *',
      [content, id]
    );
    
    return result.rows[0] || null;
  }
  
  static async delete(id) {
    const result = await pool.query(
      'DELETE FROM quotes WHERE id = $1 RETURNING *',
      [id]
    );
    
    return result.rows[0] || null;
  }
  
  static async deleteById(id, authorId) {
    const result = await pool.query(
      'DELETE FROM quotes WHERE id = $1 AND author_id = $2 RETURNING *',
      [id, authorId]
    );
    
    return result.rows[0] || null;
  }
  
  static async canUserPostToday(userId) {
    const today = new Date().toISOString().split('T')[0];
    
    const result = await pool.query(
      'SELECT id FROM quotes WHERE author_id = $1 AND DATE(created_at) = $2',
      [userId, today]
    );
    
    return result.rows.length === 0;
  }
  
  static async deleteAllQuotes() {
    await pool.query('DELETE FROM quotes');
  }
  
  static async getQuotesByDate(date) {
    const result = await pool.query(
      `SELECT q.*, u.username as author_username 
       FROM quotes q 
       JOIN users u ON q.author_id = u.id 
       WHERE DATE(q.created_at) = $1
       ORDER BY q.created_at DESC`,
      [date]
    );
    
    return result.rows;
  }

  static async findAllWithAuthor() {
    const result = await pool.query(
      `SELECT q.*, u.username as author_username, u.email as author_email
       FROM quotes q 
       JOIN users u ON q.author_id = u.id 
       ORDER BY q.created_at DESC`
    );
    
    return result.rows;
  }

  static async deleteById(id) {
    const result = await pool.query(
      'DELETE FROM quotes WHERE id = $1 RETURNING *',
      [id]
    );
    
    return result.rows[0] || null;
  }

  static async deleteAll() {
    const result = await pool.query('DELETE FROM quotes RETURNING id');
    return result.rows.length;
  }
}

module.exports = Quote;
