"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getSocket } from "@/lib/socket/client";
import { IoGameController, IoAdd, IoEnter } from "react-icons/io5";

export default function LobbyPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [roomId, setRoomId] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const handleCreateRoom = () => {
    if (!user) return;
    
    setIsCreating(true);
    setError("");
    const socket = getSocket();

    socket.emit('create-room', { pseudo: user.pseudo, userId: user.id });

    socket.once('room-created', (data: { roomId: string }) => {
      setIsCreating(false);
      router.push(`/game/${data.roomId}`);
    });

    socket.once('error', (data: { message: string }) => {
      setError(data.message);
      setIsCreating(false);
    });
  };

  const handleJoinRoom = () => {
    if (!user || !roomId.trim()) {
      setError("Entrez un code de partie valide");
      return;
    }

    setIsJoining(true);
    setError("");
    router.push(`/game/${roomId.trim()}`);
  };

  if (loading) {
    return null;
  }

  return (
    <div className="hero min-h-screen">
      <div className="hero-content text-center">
        <div className="max-w-2xl">
          <div className="flex justify-center mb-6">
            <IoGameController className="text-6xl text-primary" />
          </div>
          <h1 className="text-5xl font-bold mb-8">Lobby Puissance 4</h1>
          <p className="text-lg mb-8">
            Créez une nouvelle partie ou rejoignez une partie existante !
          </p>

          {error && (
            <div className="alert alert-error mb-6">
              <span>{error}</span>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h2 className="card-title justify-center">Créer une partie</h2>
                <p className="text-sm mb-4">
                  Créez une nouvelle partie et partagez le code avec un ami
                </p>
                <button
                  onClick={handleCreateRoom}
                  disabled={isCreating}
                  className="btn btn-primary"
                >
                  {isCreating ? (
                    <>
                      <span className="loading loading-spinner"></span>
                      Création...
                    </>
                  ) : (
                    <>
                      <IoAdd className="text-xl" />
                      Créer une partie
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h2 className="card-title justify-center">Rejoindre une partie</h2>
                <p className="text-sm mb-4">
                  Entrez le code de partie fourni par votre ami
                </p>
                <input
                  type="text"
                  placeholder="Code de la partie"
                  className="input input-bordered w-full mb-4"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  disabled={isJoining}
                />
                <button
                  onClick={handleJoinRoom}
                  disabled={isJoining || !roomId.trim()}
                  className="btn btn-secondary"
                >
                  {isJoining ? (
                    <>
                      <span className="loading loading-spinner"></span>
                      Connexion...
                    </>
                  ) : (
                    <>
                      <IoEnter className="text-xl" />
                      Rejoindre
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

