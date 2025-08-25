import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import './ResetPasswordPage.css';

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    console.log('ResetPasswordPage mounted');
    const tokenParam = searchParams.get('token');
    console.log('Token from URL:', tokenParam);
    if (!tokenParam) {
      console.log('No token found in URL');
      setError('유효하지 않은 비밀번호 재설정 링크입니다.');
      return;
    }
    setToken(tokenParam);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setError('유효하지 않은 토큰입니다.');
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError('모든 필드를 입력해주세요.');
      return;
    }

    if (newPassword.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await authService.resetPassword(token, newPassword);
      setSuccess(true);
    } catch (error: any) {
      console.error('Password reset failed:', error);
      setError(error.response?.data?.message || '비밀번호 재설정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="reset-password-page">
        <div className="reset-password-container">
          <div className="success-message">
            <h1>비밀번호 재설정 완료</h1>
            <p>비밀번호가 성공적으로 변경되었습니다.</p>
            <p>새로운 비밀번호로 로그인해주세요.</p>
          </div>
          <div className="reset-password-links">
            <Link to="/login" className="login-link">로그인하기</Link>
          </div>
        </div>
      </div>
    );
  }

  if (!token && !error) {
    return (
      <div className="reset-password-page">
        <div className="reset-password-container">
          <div className="loading-message">
            <h1>로딩 중...</h1>
            <p>비밀번호 재설정 페이지를 불러오는 중입니다.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="reset-password-page">
        <div className="reset-password-container">
          <div className="error-message">
            <h1>오류</h1>
            <p>{error}</p>
          </div>
          <div className="reset-password-links">
            <Link to="/login">로그인으로 돌아가기</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-page">
      <div className="reset-password-container">
        <h1>새 비밀번호 설정</h1>
        <p className="description">
          새로운 비밀번호를 입력해주세요.
        </p>
        
        <form onSubmit={handleSubmit} className="reset-password-form">
          <div className="form-group">
            <label htmlFor="newPassword">새 비밀번호</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="새 비밀번호를 입력하세요 (6자 이상)"
              minLength={6}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">새 비밀번호 확인</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="새 비밀번호를 다시 입력하세요"
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" disabled={loading} className="reset-password-button">
            {loading ? '처리 중...' : '비밀번호 변경'}
          </button>
        </form>
        
        <div className="reset-password-links">
          <Link to="/login">로그인으로 돌아가기</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
