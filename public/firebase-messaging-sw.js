// Firebase Messaging Service Worker — background handler
importScripts('https://www.gstatic.com/firebasejs/12.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.13.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBkFSBnPdT9TfmcTe5ImI5QBCFEl5vbE_0",
  authDomain: "bhumiamartya-fe85c.firebaseapp.com",
  projectId: "bhumiamartya-fe85c",
  storageBucket: "bhumiamartya-fe85c.firebasestorage.app",
  messagingSenderId: "59259824153",
  appId: "1:59259824153:web:d5172b96ca4a9ddf1ee288",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || "Bhumi";
  const options = {
    body: payload.notification?.body || "",
    icon: "/images/logo.png",
    data: payload.data || {},
  };
  self.registration.showNotification(title, options);
});
