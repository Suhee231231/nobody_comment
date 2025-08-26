// 서비스 워커 업데이트 확인
export function checkForServiceWorkerUpdate() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.update();
    });
  }
}

// 서비스 워커 업데이트 이벤트 리스너
export function addServiceWorkerUpdateListener(callback: () => void) {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      callback();
    });
  }
}

// 서비스 워커 등록 상태 확인
export function isServiceWorkerSupported(): boolean {
  return 'serviceWorker' in navigator;
}

// 서비스 워커 등록
export function registerServiceWorker(): Promise<ServiceWorkerRegistration> | null {
  if (!isServiceWorkerSupported()) {
    return null;
  }

  return navigator.serviceWorker.register('/sw.js')
    .then((registration) => {
      console.log('Service Worker registered successfully:', registration);
      return registration;
    })
    .catch((error) => {
      console.error('Service Worker registration failed:', error);
      throw error;
    });
}

// 서비스 워커 업데이트 확인 및 설치
export function checkAndInstallUpdate(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!isServiceWorkerSupported()) {
      resolve();
      return;
    }

    navigator.serviceWorker.ready.then((registration) => {
      registration.update().then(() => {
        // 업데이트가 있는지 확인
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // 새 서비스 워커가 설치되었고, 현재 페이지가 제어되고 있음
                // 사용자에게 업데이트 알림을 보여줄 수 있음
                console.log('New service worker installed');
                resolve();
              }
            });
          }
        });
      });
    }).catch(reject);
  });
}
