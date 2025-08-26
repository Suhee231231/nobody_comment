import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService, { RegisterData } from '../services/authService';
import './RegisterPage.css';

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

          제4조 (이용자의 의무)
          이용자는 다음 행위를 해서는 안 됩니다:
          - 타인의 권리나 명예, 신용 등을 침해하는 행위
          - 음란, 폭력적, 차별적, 혐오적 내용의 콘텐츠 게시
          - 서비스의 정상적인 운영을 방해하는 행위
          - 타인의 개인정보를 수집, 저장, 공개하는 행위
          - 상업적 목적의 광고, 홍보, 판매 행위

          제5조 (지적재산권)
          1. 서비스와 관련된 모든 지적재산권은 서비스 제공자에게 귀속됩니다.
          2. 이용자가 서비스 내에서 작성한 콘텐츠의 저작권은 해당 이용자에게 귀속됩니다.

          제6조 (면책조항)
          서비스 제공자는 천재지변, 전쟁, 기타 불가항력으로 인한 서비스 중단에 대해 책임을 지지 않습니다.

                     제7조 (준거법 및 관할법원)
           본 약관은 대한민국 법률에 따라 규율되고 해석됩니다.

           시행일: 2025년 8월 26일

           ※ 전체 약관은 /terms-of-service.html에서 확인하실 수 있습니다.
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
          1. 필수항목: 사용자명, 이메일 주소, 비밀번호
          2. 자동수집항목: IP 주소, 쿠키, 접속 로그, 기기 정보
          3. 선택항목: 프로필 정보, 마케팅 정보 수신 동의

          제3조 (개인정보의 보유 및 이용기간)
          - 회원정보: 회원탈퇴 시까지
          - 서비스 이용기록: 3개월
          - 계약 또는 청약철회 등에 관한 기록: 5년
          - 대금결제 및 재화 등의 공급에 관한 기록: 5년
          - 소비자의 불만 또는 분쟁처리에 관한 기록: 3년

          제4조 (개인정보의 제3자 제공)
          현재로서는 개인정보를 제3자에게 제공하지 않습니다.

                     제5조 (개인정보처리의 위탁)
           - Railway: 서버 호스팅 및 데이터베이스 관리
           - Vercel: 웹 서비스 호스팅

          제6조 (정보주체의 권리)
          개인정보 열람, 정정·삭제, 처리정지를 요구할 수 있습니다.

                     제7조 (개인정보의 안전성 확보조치)
           - 개인정보의 암호화
           - 해킹 등에 대비한 기술적 대책
           - 개인정보에 대한 접근 제한

           시행일: 2025년 8월 26일

           ※ 전체 개인정보처리방침은 /privacy-policy.html에서 확인하실 수 있습니다.
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
            <div className="mt-6 flex justify-between items-center">
              <a
                href={showTerms === 'service' ? '/terms-of-service.html' : '/privacy-policy.html'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-500 text-sm underline"
              >
                전체 {showTerms === 'service' ? '이용약관' : '개인정보처리방침'} 보기
              </a>
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
