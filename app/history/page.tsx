"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { IoTrophy, IoClose, IoRemove } from "react-icons/io5";

interface GameHistory {
  id: string;
  roomId: string;
  redPlayer: { pseudo: string; firstname: string; lastname: string };
  yellowPlayer: { pseudo: string; firstname: string; lastname: string } | null;
  winner: string | null;
  status: string;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
}

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [games, setGames] = useState<GameHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ wins: 0, losses: 0, draws: 0 });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (!user) return;

    fetch(`/api/game/history?userId=${user.id}`)
      .then(res => res.json())
      .then(data => {
        setGames(data.games || []);
        setStats(data.stats || { wins: 0, losses: 0, draws: 0 });
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="hero min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  const getResultBadge = (game: GameHistory) => {
    if (!user) return null;
    
    if (game.status !== 'finished') {
      return <span className="badge">Non terminée</span>;
    }

    if (game.winner === 'draw') {
      return <span className="badge badge-info flex items-center gap-1"><IoRemove /> Nul</span>;
    }

    const isRed = game.redPlayer.pseudo === user.pseudo;
    const won = (game.winner === 'red' && isRed) || (game.winner === 'yellow' && !isRed);

    return won ? (
      <span className="badge badge-success flex items-center gap-1"><IoTrophy /> Victoire</span>
    ) : (
      <span className="badge badge-error flex items-center gap-1"><IoClose /> Défaite</span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Historique des parties</h1>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="stats shadow">
          <div className="stat">
            <div className="stat-figure text-success">
              <IoTrophy className="text-4xl" />
            </div>
            <div className="stat-title">Victoires</div>
            <div className="stat-value text-success">{stats.wins}</div>
          </div>
        </div>

        <div className="stats shadow">
          <div className="stat">
            <div className="stat-figure text-error">
              <IoClose className="text-4xl" />
            </div>
            <div className="stat-title">Défaites</div>
            <div className="stat-value text-error">{stats.losses}</div>
          </div>
        </div>

        <div className="stats shadow">
          <div className="stat">
            <div className="stat-figure text-info">
              <IoRemove className="text-4xl" />
            </div>
            <div className="stat-title">Matchs nuls</div>
            <div className="stat-value text-info">{stats.draws}</div>
          </div>
        </div>
      </div>

      {games.length === 0 ? (
        <div className="alert alert-info">
          <span>Aucune partie jouée pour le moment</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>Date</th>
                <th>Adversaire</th>
                <th>Couleur</th>
                <th>Résultat</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {games.map((game) => {
                const isRed = game.redPlayer.pseudo === user?.pseudo;
                const opponent = isRed ? game.yellowPlayer : game.redPlayer;
                
                return (
                  <tr key={game.id}>
                    <td>{formatDate(game.createdAt)}</td>
                    <td>
                      {opponent ? (
                        <div>
                          <div className="font-bold">{opponent.pseudo}</div>
                          <div className="text-sm opacity-50">
                            {opponent.firstname} {opponent.lastname}
                          </div>
                        </div>
                      ) : (
                        <span className="text-base-content/50">En attente</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${isRed ? 'badge-error' : 'badge-warning'}`}>
                        {isRed ? 'Rouge' : 'Jaune'}
                      </span>
                    </td>
                    <td>{getResultBadge(game)}</td>
                    <td>
                      <span className={`badge ${
                        game.status === 'finished' ? 'badge-success' :
                        game.status === 'playing' ? 'badge-warning' :
                        'badge-ghost'
                      }`}>
                        {game.status === 'finished' ? 'Terminée' :
                         game.status === 'playing' ? 'En cours' :
                         'En attente'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}



