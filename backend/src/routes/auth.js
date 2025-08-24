const express = require('express');
const User = require('../models/user');
const { generateToken } = require('../utils/jwt');
const { authenticateToken } = require('../middleware/auth');
const { generateVerificationToken, sendVerificationEmail, sendPasswordResetEmail } = require('../utils/emailService');
const { verifyGoogleToken, getUserInfoFromGoogle, getGoogleAuthUrl, exchangeCodeForToken } = require('../utils/googleAuth');

const router = express.Router();

// Google OAuth URL 생성
router.get('/google/url', (req, res) => {
  try {
    const authUrl = getGoogleAuthUrl();
    res.json({ authUrl });
  } catch (error) {
    console.error('Google auth URL generation failed:', error);
    res.status(500).json({ message: 'Google OAuth 설정 오류가 발생했습니다.' });
  }
});

// Google OAuth 콜백 처리
router.post('/google/callback', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ message: '인증 코드가 필요합니다.' });
    }
    
    // 코드를 액세스 토큰으로 교환
    const tokens = await exchangeCodeForToken(code);
    
    // ID 토큰에서 사용자 정보 추출
    const userInfo = await verifyGoogleToken(tokens.id_token);
    
    // 기존 사용자 확인
    let user = await User.findByGoogleId(userInfo.googleId);
    
    if (!user) {
      // 이메일로 기존 사용자 확인
      user = await User.findByEmail(userInfo.email);
      
      if (user) {
        // 기존 사용자에게 Google ID 연결
        // TODO: Google ID 업데이트 로직 구현
        return res.status(400).json({ message: '이미 가입된 이메일입니다. 일반 로그인을 이용해주세요.' });
      }
      
      // 새 사용자인 경우 404 에러 반환 (프론트엔드에서 약관 동의 모달 표시)
      return res.status(404).json({ 
        message: '새 사용자입니다. 약관 동의가 필요합니다.',
        isNewUser: true,
        userInfo: {
          googleId: userInfo.googleId,
          email: userInfo.email,
          name: userInfo.name
        }
      });
    }
    
    const token = generateToken(user.id);
    
    res.json({
      message: '구글 로그인이 완료되었습니다.',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        emailVerified: user.email_verified,
        createdAt: user.created_at
      },
      token
    });
    
  } catch (error) {
    console.error('Google OAuth callback failed:', error);
    
    // 더 구체적인 에러 메시지
    if (error.message === 'Google OAuth configuration is incomplete') {
      return res.status(500).json({ message: 'Google OAuth 설정이 완료되지 않았습니다.' });
    }
    
    if (error.message === 'Google OAuth client secret is not configured properly') {
      return res.status(500).json({ message: 'Google OAuth 클라이언트 시크릿이 올바르게 설정되지 않았습니다.' });
    }
    
    if (error.message === 'Invalid Google token') {
      return res.status(401).json({ message: '유효하지 않은 Google 토큰입니다.' });
    }
    
    res.status(500).json({ message: '구글 로그인에 실패했습니다.' });
  }
});

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
    
    // 인증 토큰 생성
    const verificationToken = generateVerificationToken();
    
    // 사용자 생성 (이메일 미인증 상태)
    const user = await User.create({ username, email, password, verificationToken });
    
    // 인증 이메일 전송
    const emailSent = await sendVerificationEmail(email, username, verificationToken);
    
    if (!emailSent) {
      return res.status(500).json({ message: '이메일 전송에 실패했습니다. 다시 시도해주세요.' });
    }
    
    res.status(201).json({
      message: '회원가입이 완료되었습니다. 이메일을 확인하여 인증을 완료해주세요.',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        emailVerified: user.email_verified,
        createdAt: user.created_at
      }
    });
    
  } catch (error) {
    console.error('회원가입 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 이메일 인증
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ message: '인증 토큰이 필요합니다.' });
    }
    
    const user = await User.verifyEmail(token);
    
    if (!user) {
      return res.status(400).json({ message: '유효하지 않거나 만료된 인증 토큰입니다.' });
    }
    
    const jwtToken = generateToken(user.id);
    
    res.json({
      message: '이메일 인증이 완료되었습니다.',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        emailVerified: user.email_verified,
        createdAt: user.created_at
      },
      token: jwtToken
    });
    
  } catch (error) {
    console.error('이메일 인증 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 구글 회원가입 (약관 동의 포함)
router.post('/google-signup', async (req, res) => {
  try {
    const { code, termsAgreed, privacyAgreed } = req.body;
    
    console.log('Google signup request received:', { 
      hasCode: !!code, 
      termsAgreed, 
      privacyAgreed 
    });
    
    if (!code) {
      return res.status(400).json({ message: 'Google 인증 코드가 필요합니다.' });
    }
    
    if (!termsAgreed || !privacyAgreed) {
      return res.status(400).json({ message: '이용약관과 개인정보처리방침에 모두 동의해주세요.' });
    }
    
    // 코드를 액세스 토큰으로 교환
    const tokens = await exchangeCodeForToken(code);
    
    // ID 토큰에서 사용자 정보 추출
    const userInfo = await verifyGoogleToken(tokens.id_token);
    
    // 기존 사용자 확인
    let user = await User.findByGoogleId(userInfo.googleId);
    
    if (user) {
      return res.status(400).json({ message: '이미 가입된 계정입니다.' });
    }
    
    // 이메일로 기존 사용자 확인
    user = await User.findByEmail(userInfo.email);
    
    if (user) {
      return res.status(400).json({ message: '이미 가입된 이메일입니다. 일반 로그인을 이용해주세요.' });
    }
    
    // 새 사용자 생성 (약관 동의 정보 포함)
    console.log('Creating new user with Google and terms agreement...');
    user = await User.createWithGoogleAndTerms({ 
      username: userInfo.name, 
      email: userInfo.email, 
      googleId: userInfo.googleId,
      termsAgreed,
      privacyAgreed
    });
    console.log('New user created:', { id: user.id, username: user.username });
    
    const token = generateToken(user.id);
    
    res.json({
      message: '구글 회원가입이 완료되었습니다.',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        emailVerified: user.email_verified,
        createdAt: user.created_at
      },
      token
    });
    
  } catch (error) {
    console.error('구글 회원가입 오류:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    if (error.message === 'Invalid Google token') {
      return res.status(401).json({ message: '유효하지 않은 Google 토큰입니다.' });
    }
    
    if (error.message === 'Google OAuth code has expired or already been used') {
      return res.status(400).json({ message: 'Google 인증 코드가 만료되었거나 이미 사용되었습니다. 다시 시도해주세요.' });
    }
    
    res.status(500).json({ message: '구글 회원가입 처리 중 오류가 발생했습니다.' });
  }
});

// 구글 로그인 (ID 토큰 방식)
router.post('/google-login', async (req, res) => {
  try {
    const { accessToken } = req.body;
    
    console.log('Google login request received:', { hasAccessToken: !!accessToken });
    
    if (!accessToken) {
      return res.status(400).json({ message: 'Google 액세스 토큰이 필요합니다.' });
    }
    
    // 액세스 토큰으로 사용자 정보 가져오기
    console.log('Getting user info from Google...');
    const userInfo = await getUserInfoFromGoogle(accessToken);
    console.log('Google user info:', { 
      googleId: userInfo.googleId, 
      email: userInfo.email, 
      name: userInfo.name 
    });
    
    // 기존 사용자 확인
    let user = await User.findByGoogleId(userInfo.googleId);
    
    if (!user) {
      // 이메일로 기존 사용자 확인
      user = await User.findByEmail(userInfo.email);
      
      if (user) {
        // 기존 사용자에게 Google ID 연결
        console.log('Existing user found by email, updating Google ID...');
        try {
          await User.updateGoogleId(user.id, userInfo.googleId);
          console.log('Google ID updated successfully');
        } catch (updateError) {
          console.error('Failed to update Google ID:', updateError);
          return res.status(400).json({ message: '이미 가입된 이메일입니다. 일반 로그인을 이용해주세요.' });
        }
      } else {
        // 새 사용자 생성
        console.log('Creating new user with Google...');
        user = await User.createWithGoogle({ 
          username: userInfo.name, 
          email: userInfo.email, 
          googleId: userInfo.googleId 
        });
        console.log('New user created:', { id: user.id, username: user.username });
      }
    } else {
      console.log('Existing Google user found:', { id: user.id, username: user.username });
    }
    
    const token = generateToken(user.id);
    
    res.json({
      message: '구글 로그인이 완료되었습니다.',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        emailVerified: user.email_verified,
        createdAt: user.created_at
      },
      token
    });
    
  } catch (error) {
    console.error('구글 로그인 오류:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    // 더 구체적인 에러 메시지
    if (error.message === 'Invalid Google token') {
      return res.status(401).json({ message: '유효하지 않은 Google 토큰입니다.' });
    }
    
    res.status(500).json({ message: '구글 로그인 처리 중 오류가 발생했습니다.' });
  }
});

// 비밀번호 재설정 요청
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: '이메일을 입력해주세요.' });
    }
    
    const user = await User.findByEmail(email);
    
    if (!user) {
      // 보안을 위해 사용자가 존재하지 않아도 성공 메시지 반환
      return res.json({ message: '비밀번호 재설정 이메일을 발송했습니다.' });
    }
    
    const resetToken = generateVerificationToken();
    await User.setResetPasswordToken(email, resetToken);
    
    const emailSent = await sendPasswordResetEmail(email, user.username, resetToken);
    
    if (!emailSent) {
      return res.status(500).json({ message: '이메일 전송에 실패했습니다. 다시 시도해주세요.' });
    }
    
    res.json({ message: '비밀번호 재설정 이메일을 발송했습니다.' });
    
  } catch (error) {
    console.error('비밀번호 재설정 요청 오류:', error);
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
    
    const user = await User.resetPassword(token, newPassword);
    
    if (!user) {
      return res.status(400).json({ message: '유효하지 않거나 만료된 토큰입니다.' });
    }
    
    res.json({ message: '비밀번호가 성공적으로 변경되었습니다.' });
    
  } catch (error) {
    console.error('비밀번호 재설정 오류:', error);
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
    
    // 이메일 인증 확인
    if (!user.email_verified) {
      return res.status(401).json({ 
        message: '이메일 인증이 필요합니다. 이메일을 확인하여 인증을 완료해주세요.',
        emailVerified: false
      });
    }
    
    // 토큰 생성
    const token = generateToken(user.id);
    
    res.json({
      message: '로그인되었습니다.',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        emailVerified: user.email_verified,
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
    emailVerified: req.user.email_verified,
    createdAt: req.user.created_at
  });
});

module.exports = router;
