import React, { useState, useEffect } from 'react';
import { isServiceWorkerSupported, checkForServiceWorkerUpdate } from '../utils/serviceWorker';

const ServiceWorkerStatus: React.FC = () => {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    const checkServiceWorker = async () => {
      const supported = isServiceWorkerSupported();
      setIsSupported(supported);

      if (supported) {
        try {
          const reg = await navigator.serviceWorker.getRegistration();
          setIsRegistered(!!reg);
          setRegistration(reg || null);
        } catch (error) {
          console.error('Error checking service worker registration:', error);
        }
      }
    };

    checkServiceWorker();
  }, []);

  const handleUpdate = () => {
    checkForServiceWorkerUpdate();
  };

  if (!isSupported) {
    return (
      <div className="p-4 bg-yellow-100 border border-yellow-400 rounded-lg">
        <p className="text-yellow-800">
          ⚠️ 서비스 워커가 지원되지 않는 브라우저입니다.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-blue-100 border border-blue-400 rounded-lg">
      <h3 className="text-lg font-semibold text-blue-800 mb-2">
        서비스 워커 상태
      </h3>
      <div className="space-y-2 text-sm text-blue-700">
        <p>
          <span className="font-medium">지원 여부:</span> 
          <span className="ml-2">✅ 지원됨</span>
        </p>
        <p>
          <span className="font-medium">등록 상태:</span> 
          <span className="ml-2">
            {isRegistered ? '✅ 등록됨' : '❌ 등록되지 않음'}
          </span>
        </p>
        {registration && (
          <p>
            <span className="font-medium">활성 상태:</span> 
            <span className="ml-2">
              {registration.active ? '✅ 활성' : '❌ 비활성'}
            </span>
          </p>
        )}
      </div>
      <button
        onClick={handleUpdate}
        className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
      >
        업데이트 확인
      </button>
    </div>
  );
};

export default ServiceWorkerStatus;
