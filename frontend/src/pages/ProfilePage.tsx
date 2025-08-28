import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService, { User } from '../services/authService';
import './ProfilePage.css';

interface ProfilePageProps {
  user: User | null;
  onLogout: () => void;
  onUserUpdate: (updatedUser: User) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onLogout, onUserUpdate }) => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(user);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState(user?.username || '');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleUsernameUpdate = async () => {
    if (!newUsername.trim()) {
      setMessage({ type: 'error', text: '사용자명을 입력해주세요.' });
      return;
    }

    if (newUsername === currentUser?.username) {
      setIsEditingUsername(false);
      return;
    }

    setLoading(true);
    try {
      const updatedUser = await authService.updateUsername(newUsername);
      setCurrentUser(updatedUser);
      onUserUpdate(updatedUser); // 부모 컴포넌트의 사용자 상태 업데이트
      setMessage({ type: 'success', text: '사용자명이 변경되었습니다.' });
      setIsEditingUsername(false);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || '사용자명 변경에 실패했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setMessage({ type: 'error', text: '모든 필드를 입력해주세요.' });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: '새 비밀번호가 일치하지 않습니다.' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: '비밀번호는 6자 이상이어야 합니다.' });
      return;
    }

    setLoading(true);
    try {
      await authService.changePassword(passwordData.currentPassword, passwordData.newPassword);
      
      setMessage({ type: 'success', text: '비밀번호가 변경되었습니다.' });
      setIsChangingPassword(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || '비밀번호 변경에 실패했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  const handleAccountDeletion = async () => {
    if (deleteConfirm !== '탈퇴') {
      setMessage({ type: 'error', text: '정확히 "탈퇴"를 입력해주세요.' });
      return;
    }

    setLoading(true);
    try {
      await authService.deleteAccount();
      
      setMessage({ type: 'success', text: '회원탈퇴가 완료되었습니다.' });
      setTimeout(() => {
        onLogout();
        navigate('/');
      }, 2000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || '회원탈퇴에 실패했습니다.' });
    } finally {
      setLoading(false);
    }
  };



  if (!currentUser) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">내 정보</h1>

        {/* 메시지 표시 */}
        {message && (
          <div className={`mb-4 p-3 rounded-md ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : 'bg-red-100 text-red-700 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* 기본 정보 */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{currentUser.email}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">사용자명 (필명)</label>
              {isEditingUsername ? (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={20}
                  />
                  <button
                    onClick={handleUsernameUpdate}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                  >
                    저장
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingUsername(false);
                      setNewUsername(currentUser.username || '');
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    취소
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md flex-1">{currentUser.username}</p>
                  <button
                    onClick={() => setIsEditingUsername(true)}
                    className="px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    수정
                  </button>
                </div>
              )}
            </div>

                         {currentUser.isAdmin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">권한</label>
                <p className="text-blue-600 bg-blue-50 px-3 py-2 rounded-md font-medium">
                  관리자
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 비밀번호 변경 */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">비밀번호 변경</h2>
          {isChangingPassword ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">현재 비밀번호</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">새 비밀번호</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="6자 이상"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">새 비밀번호 확인</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handlePasswordChange}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                >
                  변경
                </button>
                <button
                  onClick={() => {
                    setIsChangingPassword(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsChangingPassword(true)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              비밀번호 변경
            </button>
          )}
        </div>

        {/* 회원탈퇴 */}
        <div className="border-t pt-6">
          <h2 className="text-lg font-semibold text-red-600 mb-4">회원탈퇴</h2>
          <p className="text-sm text-gray-600 mb-4">
            회원탈퇴 시 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.
          </p>
          
          <div className="mb-4">
            <a 
              href="/account-deletion" 
              className="inline-block px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 mb-4"
            >
              상세한 계정 삭제 정보 보기
            </a>
          </div>
          
          {isDeletingAccount ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  정말 탈퇴하시겠습니까? "탈퇴"를 입력해주세요.
                </label>
                <input
                  type="text"
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="탈퇴"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleAccountDeletion}
                  disabled={loading}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
                >
                  회원탈퇴
                </button>
                <button
                  onClick={() => {
                    setIsDeletingAccount(false);
                    setDeleteConfirm('');
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsDeletingAccount(true)}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              회원탈퇴
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
