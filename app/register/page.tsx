"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerUser } from "@/actions/auth";
import { isAuthenticated } from "@/lib/auth";

export default function RegisterPage() {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

    const result = await registerUser({
      firstname,
      lastname,
      email,
      pseudo: username,
      password,
      confirmPassword,
    });

    setLoading(false);

    if (result.success) {
      // Si l'email n'a pas été envoyé, on affiche un avertissement
      if (result.emailSent === false) {
        setError(
          "Inscription réussie, mais l'email de vérification n'a pas pu être envoyé. " +
          "Vérifiez votre configuration Brevo dans les logs Render."
        );
      } else {
        setSuccess(result.message || "Inscription réussie !");
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      }
    } else {
      setError(result.error || "Une erreur est survenue");
    }
  };

  return (
    <div className="hero min-h-screen">
      <div className="hero-content flex-col lg:flex-row-reverse">
        <div className="text-center lg:text-left lg:ml-8">
          <h1 className="text-5xl font-bold">Inscription</h1>
          <p className="py-6">
            Créez votre compte et commencez à jouer au Puissance 4 !
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
                <span className="label-text">Prénom</span>
              </label>
              <input
                type="text"
                placeholder="Votre prénom"
                className="input input-bordered"
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Nom</span>
              </label>
              <input
                type="text"
                placeholder="Votre nom"
                className="input input-bordered"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Pseudo</span>
              </label>
              <input
                type="text"
                placeholder="Votre pseudo"
                className="input input-bordered"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
              />
            </div>
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
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Confirmer le mot de passe</span>
              </label>
              <input
                type="password"
                placeholder="Confirmer le mot de passe"
                className="input input-bordered"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="form-control mt-6">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Inscription en cours..." : "S'inscrire"}
              </button>
            </div>
            <div className="text-center mt-4">
              <p className="text-sm">
                Déjà un compte ?{" "}
                <Link href="/login" className="link link-primary">
                  Se connecter
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

