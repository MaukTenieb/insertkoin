/* Insert Koin: pages and code from the network first (the cache only when offline); images, fonts and wasm from the cache, then refreshed */
const C='ik-202610092100';
self.addEventListener('install',e=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==location.origin)return;
  const fresh=e.request.mode==='navigate'||/\.(html?|js|mjs|css|json|txt|md|br)$/i.test(u.pathname)||u.pathname.endsWith('/');
  if(fresh){e.respondWith(fetch(e.request).then(r=>{if(r.ok){const k=r.clone();caches.open(C).then(c=>c.put(e.request,k));}return r;}).catch(()=>caches.match(e.request)));return;}
  e.respondWith(caches.open(C).then(c=>c.match(e.request).then(hit=>{const net=fetch(e.request).then(r=>{if(r.ok)c.put(e.request,r.clone());return r;}).catch(()=>hit);return hit||net;})));});
