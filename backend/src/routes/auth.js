const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { sendVerificationEmail } = require('../utils/emailService');
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

    // 사용자 생성
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      verificationToken: null
    });

    // 이메일 인증 토큰 생성
    const verificationToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // 인증 이메일 발송
    await sendVerificationEmail(email, user.username, verificationToken);

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

    // 사용자 찾기
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }

    // 비밀번호 확인
    const isValidPassword = await bcrypt.compare(password, user.password);
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
        emailVerified: user.email_verified
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

    // 토큰 검증
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(400).json({ message: '유효하지 않은 인증 링크입니다.' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: '이미 인증이 완료된 계정입니다.' });
    }

    // 이메일 인증 완료
    await User.updateEmailVerified(user.id, true);

    res.json({ message: '이메일 인증이 완료되었습니다.' });
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
        emailVerified: user.email_verified
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

module.exports = router;
