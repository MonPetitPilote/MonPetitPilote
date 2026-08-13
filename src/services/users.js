import { getAuth } from "../utils";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

export async function createUser(email, password) {
  const auth = getAuth();
  return await createUserWithEmailAndPassword(auth, email, password);
}

export async function logIn(email, password) {
  const auth = getAuth();
  return await signInWithEmailAndPassword(auth, email, password);
}
