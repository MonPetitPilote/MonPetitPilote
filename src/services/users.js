import { getAuth } from "../utils";
import { createUserWithEmailAndPassword } from "firebase/auth";

export async function createUser(email, password) {
  const auth = getAuth();
  return await createUserWithEmailAndPassword(auth, email, password);
}
