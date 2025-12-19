export interface User {
  id: number;
  email: string;
  pseudo: string;
  firstname: string;
  lastname: string;
}

// fonction pr sauvegarder l'utilisateur ds le localStorage
export function saveUser(user: User) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(user));
  }
}

// fonction pr récupérer l'utilisateur depuis le localStorage
export function getUser(): User | null {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
  }
  return null;
}

// fonction pr supprimer l'utilisateur du localStorage
export function removeUser() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user');
  }
}

// fonction pr vérifier si l'utilisateur est connecté
export function isAuthenticated(): boolean {
  return getUser() !== null;
}

