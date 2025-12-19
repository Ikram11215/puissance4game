"use client";

import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { IoGameController } from "react-icons/io5";

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <div className="hero min-h-screen">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold mb-8">
            {user ? `Bienvenue ${user.firstname} !` : "Bienvenue sur le Puissance 4"}
          </h1>
          <p className="text-lg mb-6">
            {user 
              ? "Prêt à jouer au Puissance 4 ?" 
              : "Préparez-vous à défier vos amis dans le jeu classique du Puissance 4 !"}
          </p>
          {user ? (
            <Link href="/lobby" className="btn btn-primary btn-lg gap-2">
              <IoGameController className="text-2xl" />
              Jouer maintenant !
            </Link>
          ) : (
            <div className="flex gap-4 justify-center">
              <a href="/login" className="btn btn-primary">
                Se connecter
              </a>
              <a href="/register" className="btn btn-outline btn-primary">
                S'inscrire
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
