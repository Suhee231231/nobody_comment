import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/authService';
import './ForgotPasswordPage.css';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('이메일을 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await authService.forgotPassword(email);
      setSuccess(true);
    } catch (error: any) {
      console.error('Forgot password failed:', error);
      setError(error.response?.data?.message || '비밀번호 재설정 요청에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="forgot-password-page">
        <div className="forgot-password-container">
          <div className="success-message">
            <h1>이메일 발송 완료</h1>
            <p>비밀번호 재설정 링크를 {email}로 발송했습니다.</p>
            <p>이메일을 확인하여 비밀번호를 재설정해주세요.</p>
          </div>
          <div className="forgot-password-links">
            <Link to="/login">로그인으로 돌아가기</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        <h1>비밀번호 찾기</h1>
        <p className="description">
          가입한 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.
        </p>
        
        <form onSubmit={handleSubmit} className="forgot-password-form">
          <div className="form-group">
            <label htmlFor="email">이메일</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="이메일을 입력하세요"
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" disabled={loading} className="forgot-password-button">
            {loading ? '전송 중...' : '비밀번호 재설정 이메일 보내기'}
          </button>
        </form>
        
        <div className="forgot-password-links">
          <Link to="/login">로그인으로 돌아가기</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
