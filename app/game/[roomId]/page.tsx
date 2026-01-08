"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getSocket, disconnectSocket } from "@/lib/socket/client";
import type { Room, Player } from "@/lib/game/types";
import Board from "@/components/game/Board";
import GameInfo from "@/components/game/GameInfo";
import { IoCopy, IoCheckmark, IoArrowBack, IoRefresh } from "react-icons/io5";

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const roomId = params.roomId as string;

  const [room, setRoom] = useState<Room | null>(null);
  const [myColor, setMyColor] = useState<Player | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [lastMove, setLastMove] = useState<{ row: number; column: number } | null>(null);
  const [gameEndReason, setGameEndReason] = useState<string | null>(null);

  // je gère la connexion à la room et les événements socket
  useEffect(() => {
    // si pas connecté, je redirige vers login
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (!user) return;

    // je récupère le socket et je rejoins la room
    const socket = getSocket();

    socket.emit('join-room', { roomId, pseudo: user.pseudo, userId: user.id });

    socket.on('room-created', (data: { room: Room }) => {
      setRoom(data.room);
      setMyColor('red');
    });

    socket.on('room-joined', (data: { room: Room }) => {
      console.log('Room joined received:', data.room);
      setRoom(data.room);
      const me = data.room.players.find(p => p.id === socket.id || p.userId === user?.id);
      console.log('Found me:', me, 'socket.id:', socket.id, 'userId:', user?.id);
      if (me && socket.id) {
        setMyColor(me.color);
        if (!me.id || me.id !== socket.id) {
          me.id = socket.id;
        }
      }
    });

    socket.on('player-joined', (data: { room: Room }) => {
      setRoom(data.room);
      const me = data.room.players.find(p => p.id === socket.id || p.userId === user?.id);
      if (me && socket.id) {
        setMyColor(me.color);
        if (!me.id || me.id !== socket.id) {
          me.id = socket.id;
        }
      }
    });

    socket.on('player-ready-update', (data: { room: Room }) => {
      setRoom(data.room);
      if (!myColor) {
        const me = data.room.players.find(p => p.userId === user?.id);
        if (me) setMyColor(me.color);
      }
    });

    socket.on('game-start', (data: { room: Room }) => {
      setRoom(data.room);
      if (!myColor) {
        const me = data.room.players.find(p => p.userId === user?.id);
        if (me) setMyColor(me.color);
      }
    });

    socket.on('move-made', (data: { room: Room, column: number, row: number }) => {
      setRoom(data.room);
      setLastMove({ row: data.row, column: data.column });
      setTimeout(() => setLastMove(null), 500);
      if (!myColor) {
        const me = data.room.players.find(p => p.userId === user?.id);
        if (me) setMyColor(me.color);
      }
    });

    socket.on('game-over', (data: { room: Room, winner?: Player, reason?: string }) => {
      const updatedRoom: Room = {
        ...data.room,
        board: {
          ...data.room.board,
          winner: data.winner || data.room.board.winner,
          status: 'finished'
        }
      };
      setRoom(updatedRoom);
      if (data.reason === 'abandon') {
        setGameEndReason('abandon');
        setError("");
      }
      if (!myColor) {
        const me = updatedRoom.players.find(p => p.userId === user?.id);
        if (me) setMyColor(me.color);
      }
    });

    socket.on('player-disconnected', (data: { room: Room, disconnectedPlayer: string }) => {
      setRoom(data.room);
      setError(`${data.disconnectedPlayer} s'est déconnecté. La partie est en pause...`);
      if (!myColor) {
        const me = data.room.players.find(p => p.userId === user?.id);
        if (me) setMyColor(me.color);
      }
    });

    socket.on('player-reconnected', (data: { room: Room }) => {
      setRoom(data.room);
      setError("");
      if (!myColor) {
        const me = data.room.players.find(p => p.userId === user?.id);
        if (me) setMyColor(me.color);
      }
    });

    socket.on('player-left', (data: { room: Room }) => {
      setRoom(data.room);
      setError("Un joueur a quitté la partie");
    });

    socket.on('error', (data: { message: string }) => {
      setError(data.message);
      console.error('Socket error:', data.message);
    });


    return () => {
      socket.off('room-created');
      socket.off('room-joined');
      socket.off('player-joined');
      socket.off('player-ready-update');
      socket.off('game-start');
      socket.off('move-made');
      socket.off('game-over');
      socket.off('player-disconnected');
      socket.off('player-reconnected');
      socket.off('player-left');
      socket.off('error');
    };
  }, [roomId, user, authLoading, router]);

  // je m'assure que ma couleur est définie
  useEffect(() => {
    if (room && user && !myColor) {
      const me = room.players.find(p => p.userId === user.id);
      if (me) {
        setMyColor(me.color);
      }
    }
  }, [room, user]);

  // fonction pr dire que je suis prêt
  const handleReady = () => {
    const socket = getSocket();
    socket.emit('player-ready', { roomId });
    setIsReady(true);
  };

  // fonction pr jouer un coup
  const handleMove = (column: number) => {
    if (!room || room.board.status !== 'playing') return;
    const socket = getSocket();
    socket.emit('make-move', { roomId, column });
  };

  // fonction pr copier l'id de la room
  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // fonction pr retourner au lobby
  const handleBackToLobby = () => {
    disconnectSocket();
    router.push('/lobby');
  };

  // fonction pr lancer une nouvelle partie
  const handleNewGame = () => {
    setGameEndReason(null);
    disconnectSocket();
    router.push('/lobby');
  };

  if (authLoading || !user) {
    return null;
  }

  if (!room) {
    return (
      <div className="hero min-h-screen">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg"></span>
          <p className="mt-4">Connexion à la partie...</p>
        </div>
      </div>
    );
  }

  const isMyTurn = room.board.currentPlayer === myColor && room.board.status === 'playing';
  const isWaiting = room.board.status === 'waiting';
  const isFinished = room.board.status === 'finished';
  const isPaused = room.board.status === 'paused';
  const hasDisconnectedPlayer = room.players.some(p => p.disconnected);

  return (
    <div className="container mx-auto px-4 py-8">
      {error && (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <button onClick={handleBackToLobby} className="btn btn-ghost gap-2">
          <IoArrowBack />
          Retour au lobby
        </button>

        <div className="flex items-center gap-2">
          <code className="bg-base-200 px-4 py-2 rounded">{roomId}</code>
          <button
            onClick={handleCopyRoomId}
            className="btn btn-square btn-ghost"
            title="Copier le code"
          >
            {copied ? <IoCheckmark className="text-success" /> : <IoCopy />}
          </button>
        </div>
      </div>

      {isPaused && (
        <div className="alert alert-warning mb-6">
          <div className="flex flex-col gap-2">
            <span className="font-bold">Partie en pause</span>
            <span>
              {hasDisconnectedPlayer 
                ? "Un joueur s'est déconnecté. La partie reprendra à sa reconnexion."
                : "Attente de reconnexion..."}
            </span>
          </div>
        </div>
      )}

      {isWaiting && (
        <div className="alert alert-info mb-6">
          <div className="flex flex-col gap-2">
            <span>
              {room.players.length === 1
                ? "En attente d'un adversaire... Partagez le code de la partie !"
                : "Les deux joueurs sont connectés !"}
            </span>
            {room.players.length === 2 && !isReady && (
              <button onClick={handleReady} className="btn btn-primary btn-sm">
                Je suis prêt !
              </button>
            )}
            {isReady && <span className="text-sm">En attente de l'adversaire...</span>}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex justify-center items-center">
          <Board
            grid={room.board.grid}
            onColumnClick={handleMove}
            isMyTurn={isMyTurn && !isPaused}
            currentPlayer={room.board.currentPlayer}
            lastMove={lastMove}
          />
        </div>

        <div>
          <GameInfo
            players={room.players}
            currentPlayer={room.board.currentPlayer}
            myColor={myColor}
            winner={room.board.winner}
            isMyTurn={isMyTurn}
          />

          {isFinished && (
            <div className="mt-4 space-y-2">
              {gameEndReason === 'abandon' && (
                <div className="alert alert-warning">
                  <span>Votre adversaire a quitté la partie. Vous avez gagné par abandon !</span>
                </div>
              )}
              <button onClick={handleNewGame} className="btn btn-primary w-full gap-2">
                <IoRefresh />
                Nouvelle partie
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

