/* アプリを更新したら VERSION を上げる（端末側のキャッシュが入れ替わる） */
const VERSION='v1';
const APP_CACHE='vocab-app-'+VERSION;
const FONT_CACHE='vocab-fonts';
const APP_FILES=['./','./index.html','./manifest.webmanifest','./audio-words-1.js','./audio-examples-1.js','./audio-examples-2.js','./audio-examples-3.js','./icon-180.png','./icon-192.png','./icon-512.png'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(APP_CACHE).then(c=>c.addAll(APP_FILES)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(
    keys.filter(k=>k.startsWith('vocab-app-')&&k!==APP_CACHE).map(k=>caches.delete(k))
  )).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.hostname==='fonts.googleapis.com'||url.hostname==='fonts.gstatic.com'){
    e.respondWith(caches.open(FONT_CACHE).then(async c=>{
      const hit=await c.match(req);
      const net=fetch(req).then(r=>{if(r.ok||r.type==='opaque')c.put(req,r.clone());return r;}).catch(()=>hit);
      return hit||net;
    }));
    return;
  }
  if(url.origin!==location.origin)return;
  e.respondWith(caches.match(req,{ignoreSearch:true}).then(hit=>{
    if(hit)return hit;
    if(req.mode==='navigate')return caches.match('./index.html');
    return fetch(req);
  }));
});
