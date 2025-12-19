"use client";

import { useEffect, useState } from "react";
import { IoTrophy, IoMedal, IoStar } from "react-icons/io5";

interface LeaderboardEntry {
  id: number;
  pseudo: string;
  firstname: string;
  lastname: string;
  wins: number;
  losses: number;
  draws: number;
  elo: number;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(res => res.json())
      .then(data => {
        setLeaderboard(data.leaderboard || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const getRankIcon = (index: number) => {
    if (index === 0) return <IoTrophy className="text-yellow-500 text-2xl" />;
    if (index === 1) return <IoMedal className="text-gray-400 text-2xl" />;
    if (index === 2) return <IoMedal className="text-amber-600 text-2xl" />;
    return <span className="text-lg font-bold w-8 text-center">{index + 1}</span>;
  };

  const getWinRate = (wins: number, losses: number, draws: number) => {
    const total = wins + losses + draws;
    if (total === 0) return 0;
    return ((wins / total) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="hero min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold mb-4">🏆 Classement Mondial</h1>
        <p className="text-lg opacity-70">
          Les meilleurs joueurs de Puissance 4
        </p>
      </div>

      {leaderboard.length === 0 ? (
        <div className="alert alert-info">
          <span>Aucun joueur dans le classement pour le moment</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th className="w-16">Rang</th>
                <th>Joueur</th>
                <th className="text-center">ELO</th>
                <th className="text-center">Victoires</th>
                <th className="text-center">Défaites</th>
                <th className="text-center">Matchs nuls</th>
                <th className="text-center">Total</th>
                <th className="text-center">% Victoires</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((player, index) => (
                <tr key={player.id} className={index < 3 ? 'bg-base-200' : ''}>
                  <td className="flex items-center justify-center">
                    {getRankIcon(index)}
                  </td>
                  <td>
                    <div>
                      <div className="font-bold">{player.pseudo}</div>
                      <div className="text-sm opacity-50">
                        {player.firstname} {player.lastname}
                      </div>
                    </div>
                  </td>
                  <td className="text-center">
                    <span className="badge badge-primary badge-lg">
                      {player.elo}
                    </span>
                  </td>
                  <td className="text-center text-success font-bold">
                    {player.wins}
                  </td>
                  <td className="text-center text-error font-bold">
                    {player.losses}
                  </td>
                  <td className="text-center text-info font-bold">
                    {player.draws}
                  </td>
                  <td className="text-center font-bold">
                    {player.wins + player.losses + player.draws}
                  </td>
                  <td className="text-center">
                    <span className="badge badge-ghost">
                      {getWinRate(player.wins, player.losses, player.draws)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}



