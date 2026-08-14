import { type FirebaseApp, initializeApp } from "firebase/app";
import { getAuth as firebaseGetAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDw4nHhz1JI9NsVipX4Dw3hu_AY_WyBDj4",
  authDomain: "monpetitpilote.firebaseapp.com",
  projectId: "monpetitpilote",
  storageBucket: "monpetitpilote.firebasestorage.app",
  messagingSenderId: "267371118460",
  appId: "1:267371118460:web:af95dad6fa4368fdffaef9",
  measurementId: "G-TY047XHDXW",
};

let firebase: FirebaseApp;

function initFirebaseIfNeeded() {
  if (!firebase) {
    firebase = initializeApp(firebaseConfig);
  }
}

export function getAuth() {
  initFirebaseIfNeeded();
  return firebaseGetAuth(firebase);
}
