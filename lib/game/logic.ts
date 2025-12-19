import { CellValue, Player, ROWS, COLS } from './types';

// je crée un plateau vide
export function createEmptyBoard(): CellValue[][] {
  return Array(ROWS).fill(null).map(() => Array(COLS).fill(null));
}

// fonction pr poser un jeton dans une colonne
export function dropPiece(
  board: CellValue[][], 
  column: number, 
  player: Player
): { newBoard: CellValue[][], row: number } | null {
  // je vérifie que la colonne est valide
  if (column < 0 || column >= COLS) return null;
  
  // je cherche la première case vide depuis le bas
  for (let row = ROWS - 1; row >= 0; row--) {
    if (board[row][column] === null) {
      // je crée une copie du plateau et je pose le jeton
      const newBoard = board.map(r => [...r]);
      newBoard[row][column] = player;
      return { newBoard, row };
    }
  }
  
  return null;
}

// fonction pr vérifier s'il y a un gagnant
export function checkWinner(board: CellValue[][], lastRow: number, lastCol: number): Player | 'draw' | null {
  const player = board[lastRow][lastCol];
  if (!player) return null;

  // je vérifie dans toutes les directions (horizontal, vertical, diagonales)
  if (checkDirection(board, lastRow, lastCol, 0, 1, player) ||
      checkDirection(board, lastRow, lastCol, 1, 0, player) ||
      checkDirection(board, lastRow, lastCol, 1, 1, player) ||
      checkDirection(board, lastRow, lastCol, 1, -1, player)) {
    return player;
  }

  // si le plateau est plein et pas de gagnant, c'est un match nul
  if (isBoardFull(board)) {
    return 'draw';
  }

  return null;
}

// fonction pr vérifier si y a 4 jetons alignés dans une direction
function checkDirection(
  board: CellValue[][],
  row: number,
  col: number,
  dRow: number,
  dCol: number,
  player: Player
): boolean {
  let count = 1;

  // je compte dans les deux sens depuis la position
  count += countInDirection(board, row, col, dRow, dCol, player);
  count += countInDirection(board, row, col, -dRow, -dCol, player);

  // si j'ai 4 ou plus, c'est gagné
  return count >= 4;
}

// fonction pr compter les jetons dans une direction
function countInDirection(
  board: CellValue[][],
  row: number,
  col: number,
  dRow: number,
  dCol: number,
  player: Player
): number {
  let count = 0;
  let r = row + dRow;
  let c = col + dCol;

  // je compte tant que je suis ds les limites et que c'est le même joueur
  while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) {
    count++;
    r += dRow;
    c += dCol;
  }

  return count;
}

// fonction pr vérifier si le plateau est plein
function isBoardFull(board: CellValue[][]): boolean {
  return board[0].every(cell => cell !== null);
}

// fonction pr obtenir la couleur de l'adversaire
export function getOpponentColor(player: Player): Player {
  return player === 'red' ? 'yellow' : 'red';
}

