import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth as firebaseGetAuth, type Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDw4nHhz1JI9NsVipX4Dw3hu_AY_WyBDj4",
  authDomain: "monpetitpilote.firebaseapp.com",
  projectId: "monpetitpilote",
  storageBucket: "monpetitpilote.firebasestorage.app",
  messagingSenderId: "267371118460",
  appId: "1:267371118460:web:af95dad6fa4368fdffaef9",
  measurementId: "G-TY047XHDXW",
};

let firebaseApp: FirebaseApp | undefined;

function initFirebaseIfNeeded(): FirebaseApp {
  if (!firebaseApp) {
    firebaseApp = initializeApp(firebaseConfig);
  }
  return firebaseApp;
}

export function getAuth(): Auth {
  const app = initFirebaseIfNeeded();
  return firebaseGetAuth(app);
}
