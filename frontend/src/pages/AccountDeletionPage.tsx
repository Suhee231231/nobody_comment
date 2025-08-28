import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import './AccountDeletionPage.css';

const AccountDeletionPage: React.FC = () => {
  const navigate = useNavigate();
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
        navigate('/');
      }, 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || '회원탈퇴에 실패했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-8">
        {/* 앱 및 개발자 정보 */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">아무개의 명언</h1>
          <p className="text-gray-600">개발자: 아무개</p>
        </div>

        <h2 className="text-2xl font-bold text-red-600 mb-6">계정 및 데이터 삭제</h2>

        {/* 메시지 표시 */}
        {message && (
          <div className={`mb-6 p-4 rounded-md ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : 'bg-red-100 text-red-700 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* 삭제 절차 안내 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">계정 삭제 절차</h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>아래 확인 문구에 "탈퇴"를 정확히 입력하세요.</li>
              <li>"계정 삭제" 버튼을 클릭하세요.</li>
              <li>삭제 확인 후 모든 데이터가 영구적으로 삭제됩니다.</li>
              <li>삭제된 데이터는 복구할 수 없습니다.</li>
            </ol>
          </div>
        </div>

        {/* 데이터 삭제/보관 정보 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">삭제되는 데이터 및 보관 정보</h3>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-red-600 mb-2">즉시 삭제되는 데이터:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>회원 정보 (이메일, 사용자명, 비밀번호)</li>
                  <li>작성한 명언 내용</li>
                  <li>좋아요 기록</li>
                  <li>프로필 정보</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-orange-600 mb-2">법적 요구사항에 따라 보관되는 데이터:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>서비스 이용 기록: 3개월 (통신비밀보호법)</li>
                  <li>계약 관련 기록: 5년 (전자상거래법)</li>
                  <li>대금결제 기록: 5년 (전자상거래법)</li>
                  <li>분쟁처리 기록: 3년 (전자상거래법)</li>
                </ul>
              </div>

              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-800">
                  <strong>주의:</strong> 보관되는 데이터는 법적 요구사항에 따라 최소한의 기간 동안만 보관되며, 
                  해당 기간이 지나면 자동으로 삭제됩니다.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 삭제 확인 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">계정 삭제 확인</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                정말 계정을 삭제하시겠습니까? "탈퇴"를 입력해주세요.
              </label>
              <input
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="탈퇴"
              />
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={handleAccountDeletion}
                disabled={loading || deleteConfirm !== '탈퇴'}
                className="px-6 py-3 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? '처리 중...' : '계정 삭제'}
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="px-6 py-3 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                취소
              </button>
            </div>
          </div>
        </div>

        {/* 연락처 정보 */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">문의 및 연락처</h3>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-gray-700 mb-2">
              <strong>개발자:</strong> 아무개
            </p>
            <p className="text-gray-700 mb-2">
              <strong>이메일:</strong> privacy@nobody-comment.com
            </p>
            <p className="text-gray-700">
              <strong>웹사이트:</strong> https://nobody-comment.vercel.app
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountDeletionPage;
