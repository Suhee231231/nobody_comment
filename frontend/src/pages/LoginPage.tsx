import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
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
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        setLoading(true);
        setError('');
        
        // Google 인증 코드를 사용하여 로그인
        const result = await authService.googleCallback(response.code);
        onLogin();
        navigate('/');
      } catch (error: any) {
        console.error('Google login failed:', error);
        setError(error.response?.data?.message || '구글 로그인에 실패했습니다.');
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setError('구글 로그인에 실패했습니다.');
      setLoading(false);
    },
    flow: 'auth-code'
  });

  const handleGoogleLogin = () => {
    setLoading(true);
    setError('');
    googleLogin();
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
        <div>
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <i className="fab fa-google text-red-500 mr-2"></i>
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
    </div>
  );
};

export default LoginPage;
