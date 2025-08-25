const bcrypt = require('bcryptjs');
const pool = require('../utils/database');

class User {
  static async create({ username, email, password, verificationToken = null }) {
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, verification_token, verification_token_expires) 
       VALUES ($1, $2, $3, $4, NOW() + INTERVAL '24 hours') 
       RETURNING id, username, email, email_verified, created_at`,
      [username, email, hashedPassword, verificationToken]
    );
    
    return result.rows[0];
  }

  static async createWithGoogle({ username, email, googleId }) {
    const result = await pool.query(
      `INSERT INTO users (username, email, google_id, email_verified, password_hash) 
       VALUES ($1, $2, $3, TRUE, '') 
       RETURNING id, username, email, email_verified, created_at`,
      [username, email, googleId]
    );
    
    return result.rows[0];
  }

  static async createWithGoogleAndTerms({ username, email, googleId, termsAgreed, privacyAgreed }) {
    const result = await pool.query(
      `INSERT INTO users (username, email, google_id, email_verified, password_hash, terms_agreed, privacy_agreed, terms_agreed_at, privacy_agreed_at) 
       VALUES ($1, $2, $3, TRUE, '', $4, $5, NOW(), NOW()) 
       RETURNING id, username, email, email_verified, created_at`,
      [username, email, googleId, termsAgreed, privacyAgreed]
    );
    
    return result.rows[0];
  }
  
  static async findByEmail(email) {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL',
      [email]
    );
    
    return result.rows[0] || null;
  }

  static async findByGoogleId(googleId) {
    const result = await pool.query(
      'SELECT * FROM users WHERE google_id = $1',
      [googleId]
    );
    
    return result.rows[0] || null;
  }

  static async findByVerificationToken(token) {
    const result = await pool.query(
      'SELECT * FROM users WHERE verification_token = $1 AND verification_token_expires > NOW()',
      [token]
    );
    
    return result.rows[0] || null;
  }

  static async findByResetToken(token) {
    const result = await pool.query(
      'SELECT * FROM users WHERE reset_password_token = $1 AND reset_password_expires > NOW()',
      [token]
    );
    
    return result.rows[0] || null;
  }
  
  static async findById(id) {
    const result = await pool.query(
      'SELECT id, username, email, email_verified, is_admin, created_at FROM users WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    
    return result.rows[0] || null;
  }
  
  static async findByUsername(username) {
    const result = await pool.query(
      'SELECT id, username, email, email_verified, created_at FROM users WHERE username = $1 AND deleted_at IS NULL',
      [username]
    );
    
    return result.rows[0] || null;
  }
  
  static async verifyPassword(user, password) {
    return await bcrypt.compare(password, user.password_hash);
  }

  static async verifyEmail(token) {
    const result = await pool.query(
      `UPDATE users 
       SET email_verified = TRUE, verification_token = NULL, verification_token_expires = NULL 
       WHERE verification_token = $1 AND verification_token_expires > NOW() 
       RETURNING id, username, email, email_verified`,
      [token]
    );
    
    return result.rows[0] || null;
  }

  static async setResetPasswordToken(email, resetToken) {
    const result = await pool.query(
      `UPDATE users 
       SET reset_password_token = $1, reset_password_expires = NOW() + INTERVAL '1 hour' 
       WHERE email = $2 
       RETURNING id, username, email`,
      [resetToken, email]
    );
    
    return result.rows[0] || null;
  }

  static async resetPassword(token, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    const result = await pool.query(
      `UPDATE users 
       SET password_hash = $1, reset_password_token = NULL, reset_password_expires = NULL 
       WHERE reset_password_token = $2 AND reset_password_expires > NOW() 
       RETURNING id, username, email`,
      [hashedPassword, token]
    );
    
    return result.rows[0] || null;
  }

  static async updatePassword(userId, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    const result = await pool.query(
      `UPDATE users 
       SET password_hash = $1 
       WHERE id = $2 
       RETURNING id, username, email`,
      [hashedPassword, userId]
    );
    
    return result.rows[0] || null;
  }
  
  static async isEmailExists(email) {
    const result = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    
    return result.rows.length > 0;
  }
  
  static async isUsernameExists(username) {
    const result = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );
    
    return result.rows.length > 0;
  }

  static async isGoogleIdExists(googleId) {
    const result = await pool.query(
      'SELECT id FROM users WHERE google_id = $1',
      [googleId]
    );
    
    return result.rows.length > 0;
  }

  static async updateGoogleId(userId, googleId) {
    const result = await pool.query(
      `UPDATE users 
       SET google_id = $1 
       WHERE id = $2 
       RETURNING id, username, email, email_verified`,
      [googleId, userId]
    );
    
    return result.rows[0] || null;
  }

  static async updateEmailVerified(userId, emailVerified) {
    const result = await pool.query(
      `UPDATE users 
       SET email_verified = $1 
       WHERE id = $2 
       RETURNING id, username, email, email_verified`,
      [emailVerified, userId]
    );
    
    return result.rows[0] || null;
  }

  static async updateVerificationToken(userId, verificationToken) {
    const result = await pool.query(
      `UPDATE users 
       SET verification_token = $1, verification_token_expires = NOW() + INTERVAL '24 hours'
       WHERE id = $2 
       RETURNING id, username, email`,
      [verificationToken, userId]
    );
    
    return result.rows[0] || null;
  }

  static async isAdmin(userId) {
    const result = await pool.query(
      'SELECT is_admin FROM users WHERE id = $1',
      [userId]
    );
    
    return result.rows[0]?.is_admin || false;
  }

  static async getAllUsers() {
    const result = await pool.query(
      'SELECT id, username, email, email_verified, is_admin, created_at FROM users ORDER BY created_at DESC'
    );
    
    return result.rows;
  }

  static async setAdminStatus(userId, isAdmin) {
    const result = await pool.query(
      `UPDATE users 
       SET is_admin = $1 
       WHERE id = $2 
       RETURNING id, username, email, is_admin`,
      [isAdmin, userId]
    );
    
    return result.rows[0] || null;
  }

  static async updateUsername(userId, username) {
    const result = await pool.query(
      `UPDATE users 
       SET username = $1 
       WHERE id = $2 
       RETURNING id, username, email`,
      [username, userId]
    );
    
    return result.rows[0] || null;
  }

  static async deleteAccount(userId) {
    // 트랜잭션 시작
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // 사용자의 명언 삭제
      await client.query('DELETE FROM quotes WHERE author_id = $1', [userId]);
      
      // 사용자의 좋아요 삭제
      await client.query('DELETE FROM likes WHERE user_id = $1', [userId]);
      
      // 사용자 정보를 재가입 가능하도록 수정 (이메일과 사용자명을 고유하지 않게 만듦)
      const shortId = userId.replace(/-/g, '').substring(0, 8);
      const timestamp = Date.now().toString().slice(-8);
      await client.query(
        `UPDATE users 
         SET email = $1, username = $2, deleted_at = NOW()
         WHERE id = $3`,
        [`del_${timestamp}_${shortId}`, `del_${timestamp}_${shortId}`, userId]
      );
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = User;
