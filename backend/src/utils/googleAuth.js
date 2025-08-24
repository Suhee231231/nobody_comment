const { OAuth2Client } = require('google-auth-library');

// Google OAuth 클라이언트 초기화 (client_secret 포함)
const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || 'https://nobody-comment.vercel.app'
);

// Google ID 토큰 검증
const verifyGoogleToken = async (idToken) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    
    return {
      googleId: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      emailVerified: payload.email_verified
    };
  } catch (error) {
    console.error('Google token verification failed:', error);
    throw new Error('Invalid Google token');
  }
};

// Google 액세스 토큰으로 사용자 정보 가져오기
const getUserInfoFromGoogle = async (accessToken) => {
  try {
    const response = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`);
    
    if (!response.ok) {
      throw new Error('Failed to get user info from Google');
    }
    
    const userInfo = await response.json();
    
    return {
      googleId: userInfo.id,
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture,
      emailVerified: userInfo.verified_email
    };
  } catch (error) {
    console.error('Failed to get user info from Google:', error);
    throw new Error('Invalid Google token');
  }
};

// Google OAuth URL 생성
const getGoogleAuthUrl = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'https://nobody-comment.vercel.app';
  const scope = 'email profile';
  
  const url = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=code&` +
    `scope=${encodeURIComponent(scope)}&` +
    `access_type=offline&` +
    `prompt=consent`;
    
  return url;
};

// Google OAuth 코드를 액세스 토큰으로 교환
const exchangeCodeForToken = async (code) => {
  try {
    // 환경 변수 확인 및 디버깅
    console.log('Google OAuth environment variables check:', {
      hasClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      hasRedirectUri: !!process.env.GOOGLE_REDIRECT_URI,
      clientIdLength: process.env.GOOGLE_CLIENT_ID?.length,
      clientSecretLength: process.env.GOOGLE_CLIENT_SECRET?.length
    });

    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      console.error('Missing Google OAuth environment variables:', {
        hasClientId: !!process.env.GOOGLE_CLIENT_ID,
        hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET
      });
      throw new Error('Google OAuth configuration is incomplete');
    }

    // OAuth2Client의 getToken 메서드 사용 (client_secret이 이미 포함됨)
    const { tokens } = await client.getToken(code);
    
    return tokens;
  } catch (error) {
    console.error('Token exchange failed:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      status: error.status,
      response: error.response?.data
    });
    
    if (error.response?.data?.error === 'invalid_request' && 
        error.response?.data?.error_description === 'client_secret is missing.') {
      throw new Error('Google OAuth client secret is not configured properly');
    }
    
    throw new Error('Failed to exchange code for token');
  }
};

module.exports = {
  verifyGoogleToken,
  getUserInfoFromGoogle,
  getGoogleAuthUrl,
  exchangeCodeForToken
};
