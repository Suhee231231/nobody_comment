import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService, { User } from '../services/authService';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await authService.logout();
    onLogout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/icon-32x32.png" 
              alt="아무개의 명언" 
              className="w-8 h-8 rounded-lg"
            />
            <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Black Han Sans', sans-serif" }}>아무개의 명언</h1>
          </Link>

          <nav className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {user.username}님
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    로그아웃
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  로그인
                </Link>
                <Link 
                  to="/register" 
                  className="btn-primary"
                >
                  회원가입
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
