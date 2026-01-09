"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useSound } from "@/hooks/useSound";
import { getSocket, disconnectSocket } from "@/lib/socket/client";
import type { Room, Player } from "@/lib/game/types";
import Board from "@/components/game/Board";
import GameInfo from "@/components/game/GameInfo";
import { IoCopy, IoCheckmark, IoArrowBack, IoRefresh, IoVolumeHigh, IoVolumeMute, IoPersonAdd, IoPause, IoPlay } from "react-icons/io5";
import { showNotification } from "@/components/ui/NotificationManager";

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
  const [wantsRematch, setWantsRematch] = useState(false);
  const [lastMove, setLastMove] = useState<{ row: number; column: number } | null>(null);
  const [gameEndReason, setGameEndReason] = useState<string | null>(null);
  const sounds = useSound();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (!user) return;

    const socket = getSocket();

    socket.emit('join-room', { roomId, pseudo: user.pseudo, userId: user.id });

    socket.on('room-created', (data: { roomId: string, room: Room }) => {
      console.log('Room created received:', data);
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
      console.log('Player joined received:', data.room, 'players:', data.room.players.length);
      setRoom(data.room);
      if (data.room.players.length === 2 && user) {
        const otherPlayer = data.room.players.find(p => p.userId !== user.id);
        if (otherPlayer) {
          showNotification(`${otherPlayer.pseudo} a rejoint la partie !`, 'success');
        }
      }
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
      sounds.playGameStart();
      showNotification('La partie commence !', 'info');
      if (!myColor) {
        const me = data.room.players.find(p => p.userId === user?.id);
        if (me) setMyColor(me.color);
      }
    });

    socket.on('move-made', (data: { room: Room, column: number, row: number }) => {
      setRoom(data.room);
      setLastMove({ row: data.row, column: data.column });
      sounds.playDrop();
      setTimeout(() => setLastMove(null), 500);
      if (!myColor) {
        const me = data.room.players.find(p => p.userId === user?.id);
        if (me) setMyColor(me.color);
      }
    });

    socket.on('game-over', (data: { room: Room, winner?: Player | 'draw', reason?: string }) => {
      const updatedRoom: Room = {
        ...data.room,
        board: {
          ...data.room.board,
          winner: data.winner || data.room.board.winner,
          status: 'finished'
        }
      };
      setRoom(updatedRoom);
      setWantsRematch(false);
      setIsReady(false);
      
      if (user && myColor) {
        const winner: Player | 'draw' | null | undefined = data.winner || data.room.board.winner;
        if (winner === 'draw') {
          sounds.playDraw();
        } else if (winner === myColor) {
          sounds.playWin();
        } else if (winner && winner !== myColor) {
          sounds.playLose();
        }
      }
      
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
      showNotification(`${data.disconnectedPlayer} s'est déconnecté. La partie est en pause...`, 'warning');
      if (!myColor) {
        const me = data.room.players.find(p => p.userId === user?.id);
        if (me) setMyColor(me.color);
      }
    });

    socket.on('player-reconnected', (data: { room: Room }) => {
      setRoom(data.room);
      setError("");
      sounds.playNotification();
      showNotification('Joueur reconnecté ! La partie reprend.', 'success');
      if (!myColor) {
        const me = data.room.players.find(p => p.userId === user?.id);
        if (me) setMyColor(me.color);
      }
    });

    socket.on('player-left', (data: { room: Room }) => {
      setRoom(data.room);
      setError("Un joueur a quitté la partie");
    });

    socket.on('rematch-requested', (data: { room: Room }) => {
      setRoom(data.room);
      const me = data.room.players.find(p => p.userId === user?.id);
      if (me) {
        if (me.isReady) {
          setWantsRematch(true);
        } else {
          setWantsRematch(false);
        }
      }
    });

    socket.on('rematch-started', (data: { room: Room }) => {
      setRoom(data.room);
      setWantsRematch(false);
      setIsReady(false);
      setGameEndReason(null);
      setError("");
      sounds.playGameStart();
      showNotification('Nouvelle partie lancée !', 'success');
      const me = data.room.players.find(p => p.userId === user?.id);
      if (me) {
        setMyColor(me.color);
      }
    });

    socket.on('error', (data: { message: string }) => {
      setError(data.message);
      sounds.playError();
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
      socket.off('rematch-requested');
      socket.off('rematch-started');
      socket.off('error');
    };
  }, [roomId, user, authLoading, router]);

  useEffect(() => {
    if (room && user && !myColor) {
      const me = room.players.find(p => p.userId === user.id);
      if (me) {
        setMyColor(me.color);
      }
    }
  }, [room, user]);

  const handleReady = () => {
    sounds.playClick();
    const socket = getSocket();
    socket.emit('player-ready', { roomId });
    setIsReady(true);
  };

  const handleMove = (column: number) => {
    if (!room || room.board.status !== 'playing') return;
    sounds.playClick();
    const socket = getSocket();
    socket.emit('make-move', { roomId, column });
  };

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBackToLobby = () => {
    disconnectSocket();
    router.push('/lobby');
  };

  const handleRematch = () => {
    if (!wantsRematch) {
      sounds.playClick();
      const socket = getSocket();
      socket.emit('request-rematch', { roomId });
      setWantsRematch(true);
    }
  };

  const handleNewGame = () => {
    setGameEndReason(null);
    setWantsRematch(false);
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
    <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-300">
      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 animate-fade-in">
            <div className="alert alert-error shadow-lg border-2">
              <span className="font-semibold">{error}</span>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mb-8">
          <button 
            onClick={handleBackToLobby} 
            className="btn btn-ghost gap-2 hover:btn-primary transition-all duration-300 shadow-md"
          >
            <IoArrowBack />
            Retour au lobby
          </button>

          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-primary/20 to-secondary/20 backdrop-blur-sm px-5 py-2.5 rounded-xl border-2 border-primary/30 shadow-lg">
              <code className="text-sm font-mono font-bold">{roomId}</code>
            </div>
            <button
              onClick={handleCopyRoomId}
              className="btn btn-square btn-ghost hover:btn-primary transition-all duration-300 shadow-md"
              title="Copier le code"
            >
              {copied ? <IoCheckmark className="text-success text-xl" /> : <IoCopy className="text-xl" />}
            </button>
            <button
              onClick={sounds.toggleSounds}
              className="btn btn-square btn-ghost hover:btn-primary transition-all duration-300 shadow-md"
              title={sounds.enabled ? "Désactiver les sons" : "Activer les sons"}
            >
              {sounds.enabled ? <IoVolumeHigh className="text-xl" /> : <IoVolumeMute className="text-xl" />}
            </button>
          </div>
        </div>

        {isPaused && (
          <div className="mb-6 animate-fade-in">
            <div className="card bg-warning/10 border-2 border-warning shadow-2xl backdrop-blur-sm">
              <div className="card-body">
                <div className="flex items-center gap-3">
                  <IoPause className="text-3xl text-warning animate-pulse" />
                  <div className="flex-1">
                    <h3 className="card-title text-warning">Partie en pause</h3>
                    <p className="text-warning-content/80">
                      {hasDisconnectedPlayer 
                        ? "Un joueur s'est déconnecté. La partie reprendra automatiquement à sa reconnexion."
                        : "Attente de reconnexion..."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {isWaiting && (
          <div className="mb-6 animate-fade-in">
            <div className="card bg-info/10 border-2 border-info shadow-2xl backdrop-blur-sm">
              <div className="card-body">
                <div className="flex items-center gap-3">
                  {room.players.length === 1 ? (
                    <IoPersonAdd className="text-3xl text-info animate-bounce" />
                  ) : (
                    <IoCheckmarkCircle className="text-3xl text-success" />
                  )}
                  <div className="flex-1">
                    <h3 className="card-title text-info">
                      {room.players.length === 1
                        ? "En attente d'un adversaire"
                        : "Les deux joueurs sont connectés !"}
                    </h3>
                    <p className="text-info-content/80 mb-3">
                      {room.players.length === 1
                        ? "Partagez le code de la partie avec votre adversaire !"
                        : "Cliquez sur 'Je suis prêt' pour commencer la partie."}
                    </p>
                    {room.players.length === 2 && !isReady && (
                      <button 
                        onClick={handleReady} 
                        className="btn btn-primary btn-lg shadow-lg hover:scale-105 transition-transform"
                      >
                        <IoCheckmarkCircle className="text-xl" />
                        Je suis prêt !
                      </button>
                    )}
                    {isReady && (
                      <div className="flex items-center gap-2 text-info">
                        <span className="loading loading-spinner loading-sm"></span>
                        <span className="font-semibold">En attente de l'adversaire...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
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
            <div className="mt-6 space-y-4 animate-fade-in">
              {gameEndReason === 'abandon' && (
                <div className="card bg-warning/10 border-2 border-warning shadow-xl">
                  <div className="card-body py-4">
                    <p className="font-semibold text-warning">
                      Votre adversaire a quitté la partie. Vous avez gagné par abandon !
                    </p>
                  </div>
                </div>
              )}
              
              <div className="card bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-primary/30 shadow-2xl backdrop-blur-sm">
                <div className="card-body">
                  <h3 className="card-title text-lg mb-4">Partie terminée</h3>
                  {room.players.length === 2 && (
                    <div className="space-y-3">
                      {!wantsRematch && (
                        <button 
                          onClick={handleRematch} 
                          className="btn btn-primary btn-lg w-full shadow-lg hover:scale-105 transition-transform gap-2"
                        >
                          <IoRefresh className="text-xl" />
                          Rejouer
                        </button>
                      )}
                      {wantsRematch && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-primary">
                            <span className="loading loading-spinner loading-sm"></span>
                            <span className="font-semibold">Vous voulez rejouer</span>
                          </div>
                          {room.players.every(p => p.isReady) ? (
                            <div className="alert alert-success shadow-md">
                              <IoCheckmarkCircle className="text-xl" />
                              <span className="font-semibold">Les deux joueurs sont prêts ! La partie va redémarrer...</span>
                            </div>
                          ) : (
                            <p className="text-sm text-base-content/70">En attente de l'adversaire...</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <button 
                onClick={handleNewGame} 
                className="btn btn-ghost w-full gap-2 hover:btn-primary transition-all duration-300 shadow-md"
              >
                <IoArrowBack />
                Retour au lobby
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
