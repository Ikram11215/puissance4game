"use client";

import { useState, useEffect } from 'react';
import { User, getUser, saveUser as saveUserToStorage, removeUser as removeUserFromStorage } from '@/lib/auth';

// hook pr gérer l'authentification
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // au chargement, je récupère l'utilisateur depuis le localStorage
  useEffect(() => {
    const currentUser = getUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  // fonction pr se connecter
  const login = (userData: User) => {
    saveUserToStorage(userData);
    setUser(userData);
  };

  // fonction pr se déconnecter
  const logout = () => {
    removeUserFromStorage();
    setUser(null);
  };

  return { user, loading, login, logout, isAuthenticated: !!user };
}

