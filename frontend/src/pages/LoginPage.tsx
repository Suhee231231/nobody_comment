import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('로그인 시도:', { email, password: password ? '***' : 'undefined' });
      const response = await authService.login({ email, password });
      console.log('로그인 응답:', response);
      if (response.token) {
        console.log('토큰 저장됨, 홈으로 이동');
        navigate('/');
      }
    } catch (err: any) {
      console.error('로그인 에러:', err);
      setError(err.response?.data?.message || '로그인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>로그인</h1>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">이메일</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">비밀번호</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" disabled={isLoading} className="login-button">
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>
        <div className="login-links">
          <a href="/register">회원가입</a>
          <span> | </span>
          <a href="/forgot-password">비밀번호 찾기</a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
