"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { verifyEmail } from "@/actions/auth";
import Link from "next/link";

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Token de vérification manquant");
      return;
    }

    const verify = async () => {
      const result = await verifyEmail(token);
      
      if (result.success) {
        setStatus("success");
        setMessage(result.message || "Email vérifié avec succès !");
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        setStatus("error");
        setMessage(result.error || "Erreur lors de la vérification");
      }
    };

    verify();
  }, [token, router]);

  return (
    <div className="hero min-h-screen">
      <div className="hero-content text-center">
        <div className="max-w-md">
          {status === "loading" && (
            <>
              <span className="loading loading-spinner loading-lg"></span>
              <h1 className="text-3xl font-bold mt-4">Vérification en cours...</h1>
            </>
          )}
          
          {status === "success" && (
            <>
              <div className="text-6xl mb-4">✅</div>
              <h1 className="text-3xl font-bold mb-4">Email vérifié !</h1>
              <p className="text-lg mb-6">{message}</p>
              <p className="text-sm text-base-content/70">
                Redirection vers la page de connexion...
              </p>
            </>
          )}
          
          {status === "error" && (
            <>
              <div className="text-6xl mb-4">❌</div>
              <h1 className="text-3xl font-bold mb-4">Erreur de vérification</h1>
              <div className="alert alert-error mb-6">
                <span>{message}</span>
              </div>
              <Link href="/login" className="btn btn-primary">
                Retour à la connexion
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

