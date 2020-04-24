var cacheName = 'viral-defence-pwa';

var filesToCache = [
    'animation.js',
    'game.html',
    'game.js',
    'levels.js',
    'manifest.json',
    'index.html',
    'sprites.js',
    'storm.js',
    'Img/boss_2688x2700x7x6.png',
    'Img/corona_256x512x1x2.png',
    'Img/corona_img.png',
    'Img/drop.png',
    'Img/drop_384x512x3x4.png',
    'Img/face_2898x2090x3x11.png',
    'Img/heart.png',
    'Img/mask_492x536x3x4.png',
    'Img/paper_1024x1024x4x2.png',
    'Img/paperIcon.png',
    'Img/pasta_560x560x2x2.png',
    'Img/Pixeboy.png',
    'Img/Pixeboy.xml',
    'Img/pure.png',
    'Img/pure_1440x1800x4x5.png',
    'Img/replay.png',
    'Img/screens_2520x3360x4x3.png',
    'Img/touch.png',
    'Img/Viral Defence.png',
    'Snd/8bit_Dungeon_Boss_Video_Classica.mp3',
    'Snd/boss_death.mp3',
    'Snd/boss_hit.mp3',
    'Snd/close.mp3',
    'Snd/cough.mp3',
    'Snd/cough2.mp3',
    'Snd/crunch.mp3',
    'Snd/Digital Voyage.mp3',
    'Snd/flump.mp3',
    'Snd/mask.mp3',
    'Snd/Mega Rust.mp3',
    'Snd/music1.mp3',
    'Snd/NES Boss.mp3',
    'Snd/open.mp3',
    'Snd/pasta.mp3',
    'Snd/pop.mp3',
    'Snd/sqrt.mp3',
    'Snd/sqrt2.mp3',
    'Snd/tp.mp3',
    'Snd/tp_hit.mp3',
    'Sys/Libs/Box2d.js',
    'Sys/Libs/Flot.js',
    'Sys/Libs/Gfx.js',
    'Sys/Libs/JQuery.js',
    'Sys/Libs/Numeral.js',
    'Sys/Libs/Pixi.js',
    'Sys/Libs/Tween.js'
];

/* Start the service worker and cache all of the app's content */
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
        console.log("attempting to install file cache");
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((r) => {
          console.log('[Service Worker] Fetching resource: '+e.request.url);
      return r || fetch(e.request).then((response) => {
                return caches.open(cacheName).then((cache) => {
          console.log('[Service Worker] Caching new resource: '+e.request.url);
          cache.put(e.request, response.clone());
          return response;
        });
      });
    })
  );
});
