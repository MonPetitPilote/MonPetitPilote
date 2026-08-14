import { type FirebaseApp, initializeApp } from "firebase/app";
import { getAuth as firebaseGetAuth } from "firebase/auth";
import {
  doc,
  getDoc as getFirestoreDoc,
  getFirestore,
} from "firebase/firestore";

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

function getDb() {
  initFirebaseIfNeeded();
  return getFirestore(firebase);
}

export function getAuth() {
  initFirebaseIfNeeded();
  return firebaseGetAuth(firebase);
}

export async function getDoc(path: string, pathSegment: string) {
  const docRef = doc(getDb(), path, pathSegment);
  const xx = await getFirestoreDoc(docRef);
  if (xx.exists()) {
    return xx.data();
  }
  const error = `Doc doesnt exist for ${path} ${pathSegment}`;
  console.error(error);
  throw new Error(error);
}
