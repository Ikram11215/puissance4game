// fonction pr calculer le changement d'elo après une partie
export function calculateEloChange(winnerElo: number, loserElo: number, isDraw: boolean = false): { winnerChange: number; loserChange: number } {
  // constante K pr le calcul elo (32 est standard)
  const K = 32;
  
  // si match nul, je calcule différemment
  if (isDraw) {
    const expectedScore = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
    const change = Math.round(K * (0.5 - expectedScore));
    return { winnerChange: change, loserChange: -change };
  }

  // je calcule le score attendu pr chaque joueur
  const expectedWinner = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
  const expectedLoser = 1 / (1 + Math.pow(10, (winnerElo - loserElo) / 400));

  // je calcule le changement d'elo (gagnant gagne, perdant perd)
  const winnerChange = Math.round(K * (1 - expectedWinner));
  const loserChange = Math.round(K * (0 - expectedLoser));

  return { winnerChange, loserChange };
}



