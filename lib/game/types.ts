export type CellValue = 'red' | 'yellow' | null;
export type Player = 'red' | 'yellow';
export type GameStatus = 'waiting' | 'playing' | 'paused' | 'finished';

export interface GameBoard {
  grid: CellValue[][];
  currentPlayer: Player;
  winner: Player | 'draw' | null;
  status: GameStatus;
}

export interface PlayerInfo {
  id: string;
  pseudo: string;
  color: Player;
  isReady: boolean;
  disconnected?: boolean;
  userId?: number;
}

export interface Room {
  id: string;
  players: PlayerInfo[];
  board: GameBoard;
  createdAt: Date;
}

export const ROWS = 6;
export const COLS = 7;

