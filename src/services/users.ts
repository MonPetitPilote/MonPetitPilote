import { getAuth } from "../utils";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updateProfile,
  type UserCredential,
} from "firebase/auth";

export async function createUser(email: string, password: string): Promise<UserCredential> {
  const auth = getAuth();
  return await createUserWithEmailAndPassword(auth, email, password);
}

export async function logIn(email: string, password: string): Promise<UserCredential> {
  const auth = getAuth();
  return await signInWithEmailAndPassword(auth, email, password);
}

export async function updateUserNickname(nickname: string): Promise<void> {
  const auth = getAuth();
  if (!auth.currentUser) throw new Error("Aucun utilisateur connecté.");
  return await updateProfile(auth.currentUser, { displayName: nickname });
}

export async function resetPassword(email: string): Promise<void> {
  const auth = getAuth();
  return await sendPasswordResetEmail(auth, email);
}
