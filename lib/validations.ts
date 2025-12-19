// fonction pr valider un email
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// fonction pr valider un mot de passe
export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 6) {
    return { valid: false, message: "Le mot de passe doit contenir au moins 6 caractères" };
  }
  return { valid: true };
}

// fonction pr valider un nom/prénom
export function validateName(name: string, fieldName: string): { valid: boolean; message?: string } {
  if (name.trim().length < 2) {
    return { valid: false, message: `${fieldName} doit contenir au moins 2 caractères` };
  }
  return { valid: true };
}

