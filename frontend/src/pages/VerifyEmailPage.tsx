import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setError('유효하지 않은 인증 링크입니다.');
        setLoading(false);
        return;
      }

      try {
        const response = await authService.verifyEmail(token);
        setSuccess(true);
        
        // 자동으로 로그인 처리
        if (response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
        }
        
      } catch (error: any) {
        console.error('이메일 인증 실패:', error);
        setError(error.response?.data?.message || '이메일 인증에 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams]);

  const handleGoToHome = () => {
    navigate('/');
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">
              이메일 인증 중...
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              잠시만 기다려주세요.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <i className="fas fa-check text-green-600 text-xl"></i>
            </div>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">
              이메일 인증 완료!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              회원가입이 성공적으로 완료되었습니다.
              <br />
              이제 아무개의 명언을 이용하실 수 있습니다.
            </p>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={handleGoToHome}
              className="btn-primary w-full"
            >
              홈으로 이동
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
            <i className="fas fa-exclamation-triangle text-red-600 text-xl"></i>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">
            인증 실패
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {error}
          </p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={handleGoToLogin}
            className="btn-primary w-full"
          >
            로그인으로 이동
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
