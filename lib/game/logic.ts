import { CellValue, Player, ROWS, COLS } from './types';

export function createEmptyBoard(): CellValue[][] {
  return Array(ROWS).fill(null).map(() => Array(COLS).fill(null));
}

export function dropPiece(
  board: CellValue[][], 
  column: number, 
  player: Player
): { newBoard: CellValue[][], row: number } | null {
  if (column < 0 || column >= COLS) return null;
  
  for (let row = ROWS - 1; row >= 0; row--) {
    if (board[row][column] === null) {
      const newBoard = board.map(r => [...r]);
      newBoard[row][column] = player;
      return { newBoard, row };
    }
  }
  
  return null;
}

export function checkWinner(board: CellValue[][], lastRow: number, lastCol: number): Player | 'draw' | null {
  const player = board[lastRow][lastCol];
  if (!player) return null;

  if (checkDirection(board, lastRow, lastCol, 0, 1, player) ||
      checkDirection(board, lastRow, lastCol, 1, 0, player) ||
      checkDirection(board, lastRow, lastCol, 1, 1, player) ||
      checkDirection(board, lastRow, lastCol, 1, -1, player)) {
    return player;
  }

  if (isBoardFull(board)) {
    return 'draw';
  }

  return null;
}

function checkDirection(
  board: CellValue[][],
  row: number,
  col: number,
  dRow: number,
  dCol: number,
  player: Player
): boolean {
  let count = 1;

  count += countInDirection(board, row, col, dRow, dCol, player);
  count += countInDirection(board, row, col, -dRow, -dCol, player);

  return count >= 4;
}

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

  while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) {
    count++;
    r += dRow;
    c += dCol;
  }

  return count;
}

function isBoardFull(board: CellValue[][]): boolean {
  return board[0].every(cell => cell !== null);
}

export function getOpponentColor(player: Player): Player {
  return player === 'red' ? 'yellow' : 'red';
}
