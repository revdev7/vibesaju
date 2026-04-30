/**
 * 바이브 사주 Service Worker v2.0
 * Network-first → 오프라인 시 캐시 폴백
 */

const CACHE_NAME = 'vibe-saju-v3';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/analytics.js',
  '/app.js',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// ─── Install: 정적 자산 프리캐싱 ───
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW v2] 정적 자산 캐싱 중...');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// ─── Activate: 이전 캐시 전부 정리 ───
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ─── Fetch: Network-first → 캐시 폴백 ───
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // API 요청 — 네트워크 전용
  if (url.pathname === '/analyze') {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({ error: '오프라인 상태입니다. 네트워크 연결을 확인해주세요.' }),
          { status: 503, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
        );
      })
    );
    return;
  }

  // 정적 자산 — 네트워크 우선, 실패 시 캐시
  event.respondWith(
    fetch(request).then(response => {
      if (response.status === 200) {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
      }
      return response;
    }).catch(() => {
      return caches.match(request).then(cached => {
        if (cached) return cached;
        if (request.headers.get('accept')?.includes('text/html')) {
          return caches.match('/');
        }
      });
    })
  );
});
