import { getAuth } from "../utils";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

export async function createUser(email: string, password: string) {
  const auth = getAuth();
  return await createUserWithEmailAndPassword(auth, email, password);
}

export async function logIn(email: string, password: string) {
  const auth = getAuth();
  return await signInWithEmailAndPassword(auth, email, password);
}

export async function updateUserNickname(nickname: string) {
  const auth = getAuth();
  if (!auth.currentUser) {
    throw new Error("User must be logged in");
  }
  return await updateProfile(auth.currentUser, { displayName: nickname });
}

export async function resetPassword(email: string) {
  const auth = getAuth();
  return await sendPasswordResetEmail(auth, email);
}
