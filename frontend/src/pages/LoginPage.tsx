import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import authService, { LoginData } from '../services/authService';

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [showTerms, setShowTerms] = useState<string | null>(null);
  const [googleAuthCode, setGoogleAuthCode] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [isProcessingGoogleAuth, setIsProcessingGoogleAuth] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Google OAuth 콜백 처리는 App.tsx에서 URL 파라미터로 처리
    // 여기서는 코드 처리 로직 제거
  }, [searchParams]);

  const handleGoogleCallback = async (code: string) => {
    try {
      setLoading(true);
      setError('');
      
      // URL에서 인증 코드 제거 (보안 강화)
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Google OAuth 코드로 백엔드에 요청
      const result = await authService.googleCallback(code);
      
      // 로그인 성공
      onLogin();
      navigate('/');
    } catch (error: any) {
      console.error('Google login check failed:', error);
      
      // 새 사용자인 경우 약관 동의 모달 표시
      if (error.response?.status === 404 && error.response?.data?.isNewUser) {
        setShowTerms('signup'); // Google 회원가입 약관 동의 모달 표시
      } else {
        setError(error.response?.data?.message || '구글 로그인에 실패했습니다.');
      }
    } finally {
      setLoading(false);
      setIsProcessingGoogleAuth(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };



  const handleGoogleLogin = () => {
    setLoading(true);
    setError('');
    setTermsAgreed(false);
    setPrivacyAgreed(false);
    
    // 백엔드의 Google OAuth URL로 리다이렉트
    const backendUrl = process.env.REACT_APP_API_URL || 'https://nobodycomment-production.up.railway.app';
    const redirectUri = encodeURIComponent(`${backendUrl}/auth/google/callback`);
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    const scope = encodeURIComponent('https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid');
    
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${redirectUri}&` +
      `response_type=code&` +
      `scope=${scope}&` +
      `access_type=offline&` +
      `prompt=consent`;
    
    window.location.href = googleAuthUrl;
  };

  const handleTermsAgreement = async () => {
    if (!termsAgreed || !privacyAgreed) {
      setError('이용약관과 개인정보처리방침에 모두 동의해주세요.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // 약관 동의와 함께 회원가입 진행
      const result = await authService.googleSignup(googleAuthCode, {
        termsAgreed,
        privacyAgreed
      });
      
      onLogin();
      navigate('/');
      setShowTerms(null);
    } catch (error: any) {
      console.error('Google signup failed:', error);
      setError(error.response?.data?.message || '회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await authService.login(formData);
      onLogin();
      navigate('/');
    } catch (error: any) {
      console.error('Login failed:', error);
      setError(error.response?.data?.message || '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!forgotPasswordEmail) {
      setError('이메일을 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await authService.forgotPassword(forgotPasswordEmail);
      setSuccess('비밀번호 재설정 이메일을 발송했습니다. 이메일을 확인해주세요.');
      setShowForgotPassword(false);
      setForgotPasswordEmail('');
    } catch (error: any) {
      console.error('Forgot password failed:', error);
      setError(error.response?.data?.message || '비밀번호 재설정 요청에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 약관 모달 렌더링
  const renderTermsModal = () => {
    if (showTerms !== 'service' && showTerms !== 'privacy') return null;

    const termsContent = {
      service: {
        title: '이용약관',
        content: `
          제1조 (목적)
          본 약관은 아무개의 명언(이하 "서비스")의 이용과 관련하여 서비스 제공자와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.

          제2조 (정의)
          1. "서비스"라 함은 일상적인 사람들의 말을 마치 위인의 명언처럼 격상시키는 소셜 플랫폼을 의미합니다.
          2. "이용자"라 함은 본 약관에 따라 서비스를 이용하는 회원을 의미합니다.

          제3조 (서비스 이용)
          1. 이용자는 하루에 100자 이내의 글을 하나씩 작성할 수 있습니다.
          2. 이용자는 다른 이용자의 글에 추천할 수 있습니다.
          3. 모든 글은 매일 자정에 자동으로 리셋됩니다.
        `
      },
      privacy: {
        title: '개인정보 처리방침',
        content: `
          제1조 (개인정보의 수집 및 이용목적)
          서비스 제공자는 다음의 목적을 위하여 개인정보를 처리합니다.
          1. 서비스 제공 및 계정 관리
          2. 고객 상담 및 문의 응대
          3. 서비스 개선 및 신규 서비스 개발

          제2조 (수집하는 개인정보 항목)
          1. 필수항목: 사용자명, 이메일 주소
          2. 선택항목: 프로필 정보

          제3조 (개인정보의 보유 및 이용기간)
          회원 탈퇴 시까지 (단, 관련 법령에 따라 보존이 필요한 경우 해당 기간까지)
        `
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{termsContent[showTerms as keyof typeof termsContent].title}</h3>
              <button
                onClick={() => setShowTerms(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="text-sm text-gray-700 whitespace-pre-line">
              {termsContent[showTerms as keyof typeof termsContent].content}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowTerms(null)}
                className="btn-primary px-4 py-2"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Google 회원가입 약관 동의 모달
  const renderGoogleSignupModal = () => {
    if (showTerms !== 'signup') return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">이용약관 및 개인정보처리방침</h3>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}
            
            <div className="space-y-4 mb-6">
              <p className="text-sm text-gray-600">
                아무개의 명언 서비스 이용을 위해 다음 약관에 동의해주세요.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={termsAgreed}
                    onChange={(e) => setTermsAgreed(e.target.checked)}
                    className="mt-1 mr-2"
                  />
                  <label htmlFor="terms" className="text-sm">
                    <span className="text-red-500">*</span> 
                    <button
                      type="button"
                      onClick={() => setShowTerms('service')}
                      className="text-primary-600 hover:underline"
                    >
                      이용약관
                    </button>에 동의합니다.
                  </label>
                </div>
                
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="privacy"
                    checked={privacyAgreed}
                    onChange={(e) => setPrivacyAgreed(e.target.checked)}
                    className="mt-1 mr-2"
                  />
                  <label htmlFor="privacy" className="text-sm">
                    <span className="text-red-500">*</span> 
                    <button
                      type="button"
                      onClick={() => setShowTerms('privacy')}
                      className="text-primary-600 hover:underline"
                    >
                      개인정보처리방침
                    </button>에 동의합니다.
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowTerms(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleTermsAgreement}
                disabled={loading || !termsAgreed || !privacyAgreed}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? '처리 중...' : '동의하고 가입하기'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-6">
          <div>
            <h2 className="text-center text-3xl font-extrabold text-gray-900">
              비밀번호 찾기
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              가입한 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.
            </p>
          </div>
          
          <form className="space-y-6" onSubmit={handleForgotPassword}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                {success}
              </div>
            )}
            
            <div>
              <label htmlFor="forgotEmail" className="block text-sm font-medium text-gray-700">
                이메일
              </label>
              <input
                id="forgotEmail"
                name="forgotEmail"
                type="email"
                autoComplete="email"
                required
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                className="input-field mt-1"
                placeholder="이메일을 입력하세요"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full disabled:opacity-50"
              >
                {loading ? '전송 중...' : '비밀번호 재설정 이메일 보내기'}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="text-sm text-primary-600 hover:text-primary-500"
              >
                로그인으로 돌아가기
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            로그인
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            아무개의 명언에 오신 것을 환영합니다!
          </p>
        </div>

        {/* 구글 로그인 버튼 */}
        <div className="w-full">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            구글로 로그인
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-50 text-gray-500">또는</span>
          </div>
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                이메일
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="input-field mt-1"
                placeholder="이메일을 입력하세요"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="input-field mt-1"
                placeholder="비밀번호를 입력하세요"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-sm text-primary-600 hover:text-primary-500"
            >
              비밀번호를 잊으셨나요?
            </button>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              계정이 없으신가요?{' '}
              <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
                회원가입
              </Link>
            </p>
          </div>
        </form>
      </div>
      
      {/* 약관 모달들 */}
      {renderTermsModal()}
      {renderGoogleSignupModal()}
    </div>
  );
};

export default LoginPage;
