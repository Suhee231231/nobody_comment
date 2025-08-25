const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const pool = require('../utils/database');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/emailService');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// 회원가입
router.post('/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;

    // 이메일 중복 확인
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: '이미 가입된 이메일입니다.' });
    }

    // 사용자명 중복 확인
    const existingUsername = await User.findByUsername(username);
    if (existingUsername) {
      return res.status(400).json({ message: '이미 사용 중인 사용자명입니다.' });
    }

    // 비밀번호 해시화
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 이메일 인증 토큰 생성
    const verificationToken = jwt.sign(
      { userId: 'temp' }, // 임시로 생성, 나중에 업데이트
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // 사용자 생성
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      verificationToken: verificationToken
    });

    // 실제 사용자 ID로 토큰 업데이트
    const actualVerificationToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // 토큰을 데이터베이스에 업데이트
    await User.updateVerificationToken(user.id, actualVerificationToken);

    // 인증 이메일 발송
    const emailSent = await sendVerificationEmail(email, user.username, actualVerificationToken);
    
    if (!emailSent) {
      // 이메일 발송 실패 시 사용자 삭제
      await User.deleteAccount(user.id);
      return res.status(500).json({ message: '이메일 발송에 실패했습니다. 다시 시도해주세요.' });
    }

    res.status(201).json({
      message: '회원가입이 완료되었습니다. 이메일을 확인하여 인증을 완료해주세요.',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        emailVerified: user.emailVerified
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 로그인
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('로그인 시도:', { email, password: password ? '***' : 'undefined' });

    // 사용자 찾기
    const user = await User.findByEmail(email);
    console.log('사용자 찾기 결과:', user ? { id: user.id, email: user.email, hasPassword: !!user.password_hash } : '사용자 없음');
    
    if (!user) {
      return res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }

    // 비밀번호 확인
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    console.log('비밀번호 확인 결과:', isValidPassword);
    
    if (!isValidPassword) {
      return res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }

    // 이메일 인증 확인
    if (!user.email_verified) {
      return res.status(401).json({ message: '이메일 인증을 완료해주세요.' });
    }

    // JWT 토큰 생성
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: '로그인 성공',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        emailVerified: user.email_verified,
        isAdmin: user.is_admin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 이메일 인증
router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;

    // 토큰으로 사용자 찾기
    const user = await User.findByVerificationToken(token);

    if (!user) {
      return res.status(400).json({ message: '유효하지 않은 인증 링크입니다.' });
    }

    if (user.email_verified) {
      return res.status(400).json({ message: '이미 인증이 완료된 계정입니다.' });
    }

    // 이메일 인증 완료
    const verifiedUser = await User.verifyEmail(token);

    // JWT 토큰 생성
    const authToken = jwt.sign(
      { userId: verifiedUser.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ 
      message: '이메일 인증이 완료되었습니다.',
      token: authToken,
      user: {
        id: verifiedUser.id,
        email: verifiedUser.email,
        username: verifiedUser.username,
        emailVerified: verifiedUser.email_verified,
        isAdmin: verifiedUser.is_admin
      }
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(400).json({ message: '유효하지 않은 인증 링크입니다.' });
  }
});

// 사용자 정보 조회
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        emailVerified: user.email_verified,
        isAdmin: user.is_admin
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 로그아웃
router.post('/logout', (req, res) => {
  res.json({ message: '로그아웃되었습니다.' });
});

// 비밀번호 재설정 요청
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: '이메일을 입력해주세요.' });
    }

    // 사용자 찾기
    const user = await User.findByEmail(email);
    
    // 보안을 위해 사용자가 존재하지 않아도 성공 메시지 반환
    if (!user) {
      return res.json({ message: '비밀번호 재설정 이메일을 발송했습니다.' });
    }

    // 비밀번호 재설정 토큰 생성
    const resetToken = jwt.sign(
      { userId: user.id, type: 'password_reset' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // 비밀번호 재설정 이메일 발송
    await sendPasswordResetEmail(email, user.username, resetToken);

    res.json({ message: '비밀번호 재설정 이메일을 발송했습니다.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 비밀번호 재설정
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: '토큰과 새 비밀번호가 필요합니다.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: '비밀번호는 6자 이상이어야 합니다.' });
    }

    // 토큰 검증
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type !== 'password_reset') {
      return res.status(400).json({ message: '유효하지 않은 토큰입니다.' });
    }

    // 사용자 찾기
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(400).json({ message: '유효하지 않은 토큰입니다.' });
    }

    // 비밀번호 업데이트
    await User.updatePassword(user.id, newPassword);

    res.json({ message: '비밀번호가 성공적으로 변경되었습니다.' });
  } catch (error) {
    console.error('Reset password error:', error);
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(400).json({ message: '유효하지 않거나 만료된 토큰입니다.' });
    }
    
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 사용자 정보 조회 (관리자용)
router.get('/user/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    // 모든 사용자 중에서 해당 이메일 찾기 (삭제된 계정 포함)
    const result = await pool.query(
      'SELECT id, username, email, email_verified, is_admin, deleted_at, created_at FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }
    
    const user = result.rows[0];
    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        emailVerified: user.email_verified,
        isAdmin: user.is_admin,
        deletedAt: user.deleted_at,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Get user by email error:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 사용자 계정 삭제 (관리자용)
router.delete('/user/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    // 사용자 찾기
    const result = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }
    
    const userId = result.rows[0].id;
    
    // 사용자 계정 삭제 (User.deleteAccount 메서드 사용)
    await User.deleteAccount(userId);
    
    res.json({ message: '사용자 계정이 삭제되었습니다.' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 임시 관리자 계정 생성 (개발용)
router.post('/create-admin', async (req, res) => {
  try {
    const { email, password, username } = req.body;
    
    if (!email || !password || !username) {
      return res.status(400).json({ message: '이메일, 비밀번호, 사용자명이 필요합니다.' });
    }

    // 기존 사용자 확인
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: '이미 존재하는 이메일입니다.' });
    }

    // 관리자 계정 생성
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const result = await pool.query(`
      INSERT INTO users (username, email, password_hash, email_verified, is_admin, terms_agreed, privacy_agreed, terms_agreed_at, privacy_agreed_at)
      VALUES ($1, $2, $3, TRUE, TRUE, TRUE, TRUE, NOW(), NOW())
      RETURNING id, username, email, is_admin
    `, [username, email, hashedPassword]);

    const user = result.rows[0];

    res.status(201).json({
      message: '관리자 계정이 생성되었습니다.',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        isAdmin: user.is_admin
      }
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ 
      message: '서버 오류가 발생했습니다.',
      error: error.message,
      stack: error.stack
    });
  }
});

// 사용자명 수정
router.put('/username', authenticateToken, async (req, res) => {
  try {
    const { username } = req.body;
    const userId = req.user.id;

    if (!username || !username.trim()) {
      return res.status(400).json({ message: '사용자명을 입력해주세요.' });
    }

    if (username.length > 20) {
      return res.status(400).json({ message: '사용자명은 20자 이하여야 합니다.' });
    }

    // 사용자명 중복 확인
    const existingUser = await User.findByUsername(username);
    if (existingUser && existingUser.id !== userId) {
      return res.status(400).json({ message: '이미 사용 중인 사용자명입니다.' });
    }

    // 사용자명 업데이트
    await User.updateUsername(userId, username.trim());

    // 업데이트된 사용자 정보 조회
    const updatedUser = await User.findById(userId);

    res.json({
      message: '사용자명이 변경되었습니다.',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        emailVerified: updatedUser.email_verified,
        isAdmin: updatedUser.is_admin
      }
    });
  } catch (error) {
    console.error('Update username error:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 비밀번호 변경
router.put('/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: '현재 비밀번호와 새 비밀번호를 입력해주세요.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: '새 비밀번호는 6자 이상이어야 합니다.' });
    }

    // 현재 사용자 정보 조회
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    // 현재 비밀번호 확인
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidPassword) {
      return res.status(400).json({ message: '현재 비밀번호가 올바르지 않습니다.' });
    }

    // 새 비밀번호 해시화 및 업데이트
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    await User.updatePassword(userId, hashedNewPassword);

    res.json({ message: '비밀번호가 변경되었습니다.' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 회원탈퇴
router.delete('/account', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // 사용자 정보 조회
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    // 사용자 관련 데이터 삭제 (명언, 좋아요 등)
    await User.deleteAccount(userId);

    res.json({ message: '회원탈퇴가 완료되었습니다.' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router;
