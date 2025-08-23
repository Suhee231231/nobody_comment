const express = require('express');
const User = require('../models/user');
const { generateToken } = require('../utils/jwt');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// 회원가입
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // 입력 검증
    if (!username || !email || !password) {
      return res.status(400).json({ message: '모든 필드를 입력해주세요.' });
    }
    
    if (username.length < 2) {
      return res.status(400).json({ message: '사용자명은 2자 이상이어야 합니다.' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ message: '비밀번호는 6자 이상이어야 합니다.' });
    }
    
    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: '올바른 이메일 형식을 입력해주세요.' });
    }
    
    // 중복 검사
    const emailExists = await User.isEmailExists(email);
    if (emailExists) {
      return res.status(400).json({ message: '이미 사용 중인 이메일입니다.' });
    }
    
    const usernameExists = await User.isUsernameExists(username);
    if (usernameExists) {
      return res.status(400).json({ message: '이미 사용 중인 사용자명입니다.' });
    }
    
    // 사용자 생성
    const user = await User.create({ username, email, password });
    const token = generateToken(user.id);
    
    res.status(201).json({
      message: '회원가입이 완료되었습니다.',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.created_at
      },
      token
    });
    
  } catch (error) {
    console.error('회원가입 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 로그인
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // 입력 검증
    if (!email || !password) {
      return res.status(400).json({ message: '이메일과 비밀번호를 입력해주세요.' });
    }
    
    // 사용자 조회
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }
    
    // 비밀번호 검증
    const isValidPassword = await User.verifyPassword(user, password);
    if (!isValidPassword) {
      return res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }
    
    // 토큰 생성
    const token = generateToken(user.id);
    
    res.json({
      message: '로그인되었습니다.',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.created_at
      },
      token
    });
    
  } catch (error) {
    console.error('로그인 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 로그아웃 (클라이언트에서 토큰 삭제)
router.post('/logout', authenticateToken, (req, res) => {
  res.json({ message: '로그아웃되었습니다.' });
});

// 현재 사용자 정보 조회
router.get('/me', authenticateToken, (req, res) => {
  res.json({
    id: req.user.id,
    username: req.user.username,
    email: req.user.email,
    createdAt: req.user.created_at
  });
});

module.exports = router;
