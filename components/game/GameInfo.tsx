import type { Player, PlayerInfo } from "@/lib/game/types";
import { IoPersonCircle } from "react-icons/io5";

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

  return (
    <div className="space-y-4">
      <div className={`alert ${winner ? (winner === myColor ? 'alert-success' : winner === 'draw' ? 'alert-info' : 'alert-error') : isMyTurn ? 'alert-info' : 'alert-warning'}`}>
        <span className="font-bold">{getCurrentTurnMessage()}</span>
      </div>

      <div className="card bg-base-200">
        <div className="card-body">
          <h3 className="card-title text-sm">Joueurs</h3>
          <div className="space-y-2">
            {players.map((player, index) => (
              <div
                key={`${player.id}-${player.color}-${index}`}
                className={`flex items-center justify-between p-2 rounded ${
                  currentPlayer === player.color && !winner ? 'bg-base-300' : ''
                } ${player.disconnected ? 'opacity-50' : ''}`}
              >
                <div className="flex items-center gap-2">
                  <IoPersonCircle className="text-2xl" />
                  <span>{player.pseudo}</span>
                  {player.color === myColor && <span className="text-xs">(Vous)</span>}
                  {player.disconnected && <span className="badge badge-warning badge-sm">Déconnecté</span>}
                </div>
                <span className={`badge ${getPlayerBadgeColor(player.color)}`}>
                  {player.color === 'red' ? 'Rouge' : 'Jaune'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

