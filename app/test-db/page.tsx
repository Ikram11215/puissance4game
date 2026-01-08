"use client";

import { useEffect, useState } from "react";

export default function TestDB() {
  const [result, setResult] = useState("Chargement...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/test-db")
      .then((r) => r.json())
      .then((data) => {
        setResult(JSON.stringify(data, null, 2));
        setLoading(false);
      })
      .catch((e) => {
        setResult("Erreur: " + e.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">Test Base de Données</h1>
      {loading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <pre className="bg-base-200 p-4 rounded overflow-auto">
              {result}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

