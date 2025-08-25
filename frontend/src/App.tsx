import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import WritePage from './pages/WritePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import authService, { User } from './services/authService';
import './App.css';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const storedUser = authService.getStoredUser();
      if (storedUser && authService.isAuthenticated()) {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      }
      
      // URL에서 Google OAuth 코드 파라미터 확인
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      
      if (code) {
        try {
          // Google OAuth 코드로 백엔드에 요청
          const result = await authService.googleCallback(code);
          setUser(result.user);
          
          // URL에서 파라미터 제거
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error: any) {
          console.error('Google OAuth callback failed:', error);
          
          // 새 사용자인 경우 로그인 페이지로 리다이렉트 (약관 동의 처리)
          if (error.response?.status === 404 && error.response?.data?.isNewUser) {
            window.location.href = `/login?code=${code}`;
            return;
          }
        }
      }
      
      // 기존 토큰 파라미터 처리 (하위 호환성)
      const token = urlParams.get('token');
      const userParam = urlParams.get('user');
      
      if (token && userParam) {
        try {
          const userData = JSON.parse(decodeURIComponent(userParam));
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(userData));
          setUser(userData);
          
          // URL에서 파라미터 제거
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
          console.error('Failed to process URL auth data:', error);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    const storedUser = authService.getStoredUser();
    setUser(storedUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || ''}>
      <Router>
        <div className="App min-h-screen bg-gray-50">
          <Header user={user} onLogout={handleLogout} />
          <main>
            <Routes>
              <Route path="/" element={<HomePage user={user} />} />
              <Route 
                path="/write" 
                element={
                  user ? <WritePage /> : <Navigate to="/login" replace />
                } 
              />
              <Route 
                path="/login" 
                element={
                  user ? <Navigate to="/" replace /> : <LoginPage onLogin={handleLogin} />
                } 
              />
              <Route 
                path="/register" 
                element={
                  user ? <Navigate to="/" replace /> : <RegisterPage onLogin={handleLogin} />
                } 
              />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
