const { OAuth2Client } = require('google-auth-library');

// Google ID 토큰 검증용 클라이언트 (리다이렉트 URI 없음)
const verifyClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Google ID 토큰 검증
const verifyGoogleToken = async (idToken) => {
  try {
    const ticket = await verifyClient.verifyIdToken({
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
  const scope = 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid';
  
  const url = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=code&` +
    `scope=${encodeURIComponent(scope)}&` +
    `access_type=offline&` +
    `prompt=consent`;
  
  console.log('Generated Google OAuth URL:', {
    clientId: clientId ? 'SET' : 'NOT SET',
    redirectUri,
    scope,
    fullUrl: url
  });
    
  return url;
};

// Google OAuth 코드를 액세스 토큰으로 교환 (완전 수동 방식)
const exchangeCodeForToken = async (code) => {
  try {
    console.log('Starting manual token exchange with code:', { codeLength: code?.length });
    
    // 환경 변수 확인
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      throw new Error('Google OAuth configuration is incomplete');
    }

    // 리다이렉트 URI 설정
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'https://nobody-comment.vercel.app';
    console.log('Using redirect URI:', redirectUri);
    console.log('Environment variables check:', {
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET',
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'NOT SET',
      GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI || 'NOT SET (using default)',
      CLIENT_ID_PREFIX: process.env.GOOGLE_CLIENT_ID?.substring(0, 20) + '...'
    });

    // 수동으로 URLSearchParams 생성
    const params = new URLSearchParams();
    params.append('code', code);
    params.append('client_id', process.env.GOOGLE_CLIENT_ID);
    params.append('client_secret', process.env.GOOGLE_CLIENT_SECRET);
    params.append('redirect_uri', redirectUri);
    params.append('grant_type', 'authorization_code');

    console.log('Request parameters:', {
      code: code.substring(0, 10) + '...',
      client_id: process.env.GOOGLE_CLIENT_ID?.substring(0, 20) + '...',
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    });

    // Google OAuth 토큰 엔드포인트로 직접 요청
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: params.toString()
    });

    console.log('Token response status:', tokenResponse.status);
    console.log('Token response headers:', Object.fromEntries(tokenResponse.headers.entries()));

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('Token exchange failed:', errorData);
      console.error('Request details:', {
        code: code.substring(0, 10) + '...',
        client_id: process.env.GOOGLE_CLIENT_ID?.substring(0, 20) + '...',
        redirect_uri: redirectUri,
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        responseBody: errorData
      });
      throw new Error(`Token exchange failed: ${errorData.error} - ${errorData.error_description}`);
    }

    const tokens = await tokenResponse.json();
    console.log('Token exchange successful:', { hasAccessToken: !!tokens.access_token });
    
    return tokens;
  } catch (error) {
    console.error('Token exchange failed:', error);
    throw error;
  }
};

module.exports = {
  verifyGoogleToken,
  getUserInfoFromGoogle,
  getGoogleAuthUrl,
  exchangeCodeForToken
};
