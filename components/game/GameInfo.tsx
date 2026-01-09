import type { Player, PlayerInfo } from "@/lib/game/types";
import { IoPersonCircle, IoTrophy, IoClose, IoRemove } from "react-icons/io5";

interface GameInfoProps {
  players: PlayerInfo[];
  currentPlayer: Player;
  myColor: Player | null;
  winner: Player | 'draw' | null;
  isMyTurn: boolean;
}

export default function GameInfo({ players, currentPlayer, myColor, winner, isMyTurn }: GameInfoProps) {
  const getPlayerBadgeColor = (color: Player) => {
    return color === 'red' ? 'badge-error' : 'badge-warning';
  };

  const getCurrentTurnMessage = () => {
    if (winner) {
      if (winner === 'draw') return "Match nul !";
      if (winner === myColor) return "Vous avez gagné !";
      return "Vous avez perdu !";
    }

    if (isMyTurn) return "C'est votre tour !";
    return "Tour de l'adversaire...";
  };

  const getStatusCardStyle = () => {
    if (winner) {
      if (winner === myColor) return 'bg-gradient-to-r from-success/20 to-success/10 border-success shadow-success/50';
      if (winner === 'draw') return 'bg-gradient-to-r from-info/20 to-info/10 border-info shadow-info/50';
      return 'bg-gradient-to-r from-error/20 to-error/10 border-error shadow-error/50';
    }
    return isMyTurn 
      ? 'bg-gradient-to-r from-primary/20 to-primary/10 border-primary shadow-primary/50 animate-pulse-glow'
      : 'bg-gradient-to-r from-warning/20 to-warning/10 border-warning shadow-warning/50';
  };

  const getStatusIcon = () => {
    if (winner === myColor) return <IoTrophy className="text-2xl text-success" />;
    if (winner === 'draw') return <IoRemove className="text-2xl text-info" />;
    if (winner && winner !== myColor) return <IoClose className="text-2xl text-error" />;
    return null;
  };

  return (
    <div className="space-y-4">
      <div className={`card border-2 shadow-xl backdrop-blur-sm ${getStatusCardStyle()}`}>
        <div className="card-body py-4">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <span className="font-bold text-lg">{getCurrentTurnMessage()}</span>
          </div>
        </div>
      </div>

      <div className="card bg-base-200/80 backdrop-blur-sm border-2 border-base-300 shadow-xl">
        <div className="card-body">
          <h3 className="card-title text-base mb-3">Joueurs</h3>
          <div className="space-y-3">
            {players.map((player, index) => (
              <div
                key={`${player.id}-${player.color}-${index}`}
                className={`
                  flex items-center justify-between p-3 rounded-xl
                  transition-all duration-300
                  ${currentPlayer === player.color && !winner 
                    ? 'bg-gradient-to-r from-primary/30 to-primary/10 border-2 border-primary shadow-lg scale-105' 
                    : 'bg-base-300/50 border border-base-content/10'
                  }
                  ${player.disconnected ? 'opacity-60 grayscale' : 'hover:scale-105'}
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`${player.color === 'red' ? 'text-error' : 'text-warning'}`}>
                    <IoPersonCircle className="text-3xl" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold">{player.pseudo}</span>
                    {player.color === myColor && (
                      <span className="text-xs text-primary font-medium">(Vous)</span>
                    )}
                  </div>
                  {player.disconnected && (
                    <span className="badge badge-warning badge-sm animate-pulse">Déconnecté</span>
                  )}
                </div>
                <span className={`badge ${getPlayerBadgeColor(player.color)} badge-lg shadow-md`}>
                  {player.color === 'red' ? '🔴 Rouge' : '🟡 Jaune'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

