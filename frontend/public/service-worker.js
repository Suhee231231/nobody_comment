const CACHE_NAME = 'nobody-comment-v2';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/icon-32x32.png',
  '/icon-144x144.png',
  '/icon-152x152.png',
  '/icon-180x180.png',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

// Service Worker 설치
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('캐시가 열렸습니다');
        return cache.addAll(urlsToCache).catch((error) => {
          console.log('일부 파일 캐싱 실패:', error);
          // 실패해도 설치 계속 진행
          return Promise.resolve();
        });
      })
  );
});

// Service Worker 활성화
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('이전 캐시 삭제:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // 즉시 클라이언트 제어권 가져오기
      return self.clients.claim();
    })
  );
});

// 네트워크 요청 가로채기
self.addEventListener('fetch', (event) => {
  // API 요청은 네트워크 우선, 실패 시 캐시 사용
  if (event.request.url.includes('/api/') || event.request.url.includes('railway.app')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }

  // 정적 리소스는 캐시 우선, 실패 시 네트워크 사용
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// 메시지 처리 (앱에서 Service Worker와 통신)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
