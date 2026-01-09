export function calculateEloChange(winnerElo: number, loserElo: number, isDraw: boolean = false): { winnerChange: number; loserChange: number } {
  const K = 32;
  
  if (isDraw) {
    const expectedScore = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
    const change = Math.round(K * (0.5 - expectedScore));
    return { winnerChange: change, loserChange: -change };
  }

  const expectedWinner = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
  const expectedLoser = 1 / (1 + Math.pow(10, (winnerElo - loserElo) / 400));

  const winnerChange = Math.round(K * (1 - expectedWinner));
  const loserChange = Math.round(K * (0 - expectedLoser));

  return { winnerChange, loserChange };
}
