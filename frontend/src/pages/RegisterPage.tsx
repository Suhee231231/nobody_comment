import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService, { RegisterData } from '../services/authService';

interface RegisterPageProps {
  onLogin: () => void;
}

interface TermsAgreement {
  service: boolean;
  privacy: boolean;
  marketing: boolean;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onLogin }) => {
  const [formData, setFormData] = useState<RegisterData>({
    username: '',
    email: '',
    password: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [termsAgreement, setTermsAgreement] = useState<TermsAgreement>({
    service: false,
    privacy: false,
    marketing: false,
  });
  const [showTerms, setShowTerms] = useState<'service' | 'privacy' | null>(null);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleTermsChange = (type: keyof TermsAgreement) => {
    setTermsAgreement(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
    setError('');
  };

  const handleGoogleLogin = () => {
    setLoading(true);
    setError('');
    
    // 직접 Google OAuth URL로 리다이렉트
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    const redirectUri = encodeURIComponent(window.location.origin);
    const scope = encodeURIComponent('email profile');
    
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${redirectUri}&` +
      `response_type=code&` +
      `scope=${scope}&` +
      `access_type=offline&` +
      `prompt=consent`;
    
    window.location.href = googleAuthUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.email || !formData.password) {
      setError('모든 필드를 입력해주세요.');
      return;
    }

    if (formData.password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (formData.password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    if (formData.username.length < 2) {
      setError('사용자명은 2자 이상이어야 합니다.');
      return;
    }

    if (!termsAgreement.service || !termsAgreement.privacy) {
      setError('이용약관과 개인정보 처리방침에 동의해주세요.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      // TODO: 이메일 인증 요청 API 호출
      await authService.register(formData);
      setEmailSent(true);
      setSuccess('인증 메일을 발송했습니다. 이메일을 확인해주세요.');
    } catch (error: any) {
      console.error('Registration failed:', error);
      setError(error.response?.data?.message || '회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const renderTermsModal = () => {
    if (!showTerms) return null;

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
              <h3 className="text-lg font-semibold">{termsContent[showTerms].title}</h3>
              <button
                onClick={() => setShowTerms(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="text-sm text-gray-700 whitespace-pre-line">
              {termsContent[showTerms].content}
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

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <i className="fas fa-envelope text-green-600 text-xl"></i>
            </div>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">
              인증 메일 발송 완료
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {formData.email}로 인증 메일을 발송했습니다.
              <br />
              이메일을 확인하여 계정을 활성화해주세요.
            </p>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={() => setEmailSent(false)}
              className="btn-primary w-full"
            >
              다시 작성하기
            </button>
            <Link
              to="/login"
              className="block text-center text-sm text-primary-600 hover:text-primary-500"
            >
              로그인으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            회원가입
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            아무개의 명언에 가입하고 오늘의 명언을 작성해보세요!
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
            구글로 회원가입
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
          
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                사용자명(필명)
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={formData.username}
                onChange={handleChange}
                className="input-field mt-1"
                placeholder="사용자명을 입력하세요"
              />
            </div>
            
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
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="input-field mt-1"
                placeholder="비밀번호를 입력하세요 (6자 이상)"
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                비밀번호 확인
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field mt-1"
                placeholder="비밀번호를 다시 입력하세요"
              />
            </div>
          </div>

          {/* 약관 동의 */}
          <div className="space-y-3">
            <div className="flex items-start">
              <input
                id="service"
                type="checkbox"
                checked={termsAgreement.service}
                onChange={() => handleTermsChange('service')}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
              />
              <label htmlFor="service" className="ml-2 block text-sm text-gray-700">
                <span className="text-red-500">*</span>{' '}
                <button
                  type="button"
                  onClick={() => setShowTerms('service')}
                  className="text-primary-600 hover:text-primary-500 underline"
                >
                  이용약관
                </button>
                에 동의합니다.
              </label>
            </div>

            <div className="flex items-start">
              <input
                id="privacy"
                type="checkbox"
                checked={termsAgreement.privacy}
                onChange={() => handleTermsChange('privacy')}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
              />
              <label htmlFor="privacy" className="ml-2 block text-sm text-gray-700">
                <span className="text-red-500">*</span>{' '}
                <button
                  type="button"
                  onClick={() => setShowTerms('privacy')}
                  className="text-primary-600 hover:text-primary-500 underline"
                >
                  개인정보 처리방침
                </button>
                에 동의합니다.
              </label>
            </div>

            <div className="flex items-start">
              <input
                id="marketing"
                type="checkbox"
                checked={termsAgreement.marketing}
                onChange={() => handleTermsChange('marketing')}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
              />
              <label htmlFor="marketing" className="ml-2 block text-sm text-gray-700">
                마케팅 정보 수신에 동의합니다. (선택)
              </label>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? '가입 중...' : '회원가입'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              이미 계정이 있으신가요?{' '}
              <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                로그인
              </Link>
            </p>
          </div>
        </form>

        {renderTermsModal()}
      </div>
    </div>
  );
};

export default RegisterPage;
