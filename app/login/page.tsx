"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginUser } from "@/actions/auth";
import { saveUser, isAuthenticated } from "@/lib/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      router.push("/");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const result = await loginUser({
      email,
      password,
    });

    setLoading(false);

    if (result.success && result.user) {
      saveUser(result.user);
      setSuccess(result.message || "Connexion réussie !");
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } else {
      setError(result.error || "Une erreur est survenue");
    }
  };

  return (
    <div className="hero min-h-screen">
      <div className="hero-content flex-col lg:flex-row-reverse">
        <div className="text-center lg:text-left lg:ml-8">
          <h1 className="text-5xl font-bold">Connexion</h1>
          <p className="py-6">
            Connectez-vous pour accéder à vos parties de Puissance 4 !
          </p>
        </div>
        <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
          <form className="card-body" onSubmit={handleSubmit}>
            {error && (
              <div className="alert alert-error">
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="alert alert-success">
                <span>{success}</span>
              </div>
            )}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                placeholder="email@exemple.com"
                className="input input-bordered"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Mot de passe</span>
              </label>
              <input
                type="password"
                placeholder="Mot de passe"
                className="input input-bordered"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <label className="label">
                <a href="#" className="label-text-alt link link-hover">
                  Mot de passe oublié ?
                </a>
              </label>
            </div>
            <div className="form-control mt-6">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Connexion en cours..." : "Se connecter"}
              </button>
            </div>
            <div className="text-center mt-4">
              <p className="text-sm">
                Pas encore de compte ?{" "}
                <Link href="/register" className="link link-primary">
                  S'inscrire
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

