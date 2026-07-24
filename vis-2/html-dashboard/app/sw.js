// v2: network-first for the actively-changing shell (html/css/js), so a
// re-upload is visible immediately instead of being stuck behind a stale
// cache-first copy. Icons/manifest rarely change, so those stay cache-first
// for fast/offline loading. Bumping CACHE below forces old caches to be
// dropped in 'activate' — bump it again whenever this file changes.
const CACHE = 'dashboard-shell-v3';
const STATIC_ASSETS = [
  './manifest.json',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

self.addEventListener('install', (e)=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e)=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
  );
  self.clients.claim();
});

const NETWORK_FIRST = ['/', '/index.html', '/app.css', '/app.js'];

self.addEventListener('fetch', (e)=>{
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return; // cross-origin (simple-api) always goes straight to network

  const isShell = NETWORK_FIRST.some(p => url.pathname.endsWith(p));
  if (isShell){
    // Network-first: always try to get the latest file; only fall back to
    // whatever's cached if the device is actually offline.
    e.respondWith(
      fetch(e.request).then(res=>{
        const copy = res.clone();
        caches.open(CACHE).then(c=>c.put(e.request, copy));
        return res;
      }).catch(()=> caches.match(e.request))
    );
    return;
  }
  // Static assets (icons, manifest): cache-first is fine, they rarely change.
  e.respondWith(caches.match(e.request).then(cached => cached || fetch(e.request)));
});
