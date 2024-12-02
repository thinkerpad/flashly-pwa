importScripts("https://www.gstatic.com/firebasejs/11.0.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.0.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyAWjUl1um01-IcuaNOceTSHnIK4OCPPjLY",
  authDomain: "flashly-30428.firebaseapp.com",
  projectId: "flashly-30428",
  storageBucket: "flashly-30428.firebasestorage.app",
  messagingSenderId: "169889460349",
  appId: "1:169889460349:web:d268da59334312fe5dc114",
  measurementId: "G-9FCSLT4MFN"
});

const messaging = firebase.messaging();
messaging.onBackgroundMessage(function(payload) {
  console.log("[sericeworker.js] Recevied background messages ", payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {body: payload.notification.body, icon: "img/icon/icon-256x256.png"};
  self.ServiceWorkerRegistration.showNotification(notificationTitle, notificationOptions);
});

const CACHE_NAME = "flashly-v3";

const ASSETS_TO_CACHE = [
  "/",
  "index.html",
  "pages/explore.html",
  "pages/flashcard.html",
  "pages/study.html",
  "pages/auth.html",
  "css/styles.css",
  "css/materialize.min.css",
  "js/materialize.min.js",
  "js/ui.js",
  "img/code.jpg",
  "img/cs.jpg",
  "img/csci-331.jpg",
  "img/csci-663.webp",
  "img/geo.jpg",
  "img/inf-360.png",
  "img/inf-652.jpg",
  "img/inf-654.jpg",
  "img/info.png",
  "img/web.jpg",
];

self.addEventListener("install", (event) => {
  console.log("Service worker: Installing...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Service worker: caching files");
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activating...");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("service Worker: Deleting old Cache");
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

self.addEventListener("fetch", (event) => {
  console.log("Service Worker: Fetching...", event.request.url);
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type == "FCM_TOKEN") {
    const fcmToken = event.data.token;
    console.log("Recevied FCM token in service worker: ", fcmToken);
  }
});

self.addEventListener("push", (event) => {
  if (event.data) {
    const payload = event.data.json();
    const { title, body, icon } = payload.notification;
    const options = {
      body, 
      icon: icon || "img/icon/icon-256x256.png",
    };
    event.waitUntil(self.registration.showNotification(title, options))
  }
})

