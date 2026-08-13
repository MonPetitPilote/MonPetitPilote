import { getAuth } from "../utils";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

export async function createUser(email, password) {
  const auth = getAuth();
  return await createUserWithEmailAndPassword(auth, email, password);
}

export async function logIn(email, password) {
  const auth = getAuth();
  return await signInWithEmailAndPassword(auth, email, password);
}

export async function updateUserNickname(nickname) {
  const auth = getAuth();
  return await updateProfile(auth.currentUser, { displayName: nickname });
}

export async function resetPassword(email) {
  const auth = getAuth();
  return await sendPasswordResetEmail(auth, email);
}
