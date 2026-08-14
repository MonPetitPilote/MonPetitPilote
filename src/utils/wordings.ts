export function translateFirebaseError(error: any) {
  switch (error.code) {
    case "auth/invalid-email":
      return "L'adresse email n'est pas valide.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Email ou mot de passe incorrect.";
    case "auth/email-already-in-use":
      return "Un compte existe déjà avec cet email.";
    case "auth/weak-password":
      return "Le mot de passe doit contenir au moins 6 caractères.";
    default:
      return "Une erreur est survenue : " + error.message;
  }
}
