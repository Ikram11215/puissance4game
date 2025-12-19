import type { CellValue, Player } from "@/lib/game/types";
import { ROWS, COLS } from "@/lib/game/types";
import Cell from "./Cell";
import { IoArrowDown } from "react-icons/io5";
import { useState } from "react";

interface BoardProps {
  grid: CellValue[][];
  onColumnClick: (column: number) => void;
  isMyTurn: boolean;
  currentPlayer: Player;
  lastMove?: { row: number; column: number } | null;
}

export default function Board({ grid, onColumnClick, isMyTurn, currentPlayer, lastMove }: BoardProps) {
  const [hoveredColumn, setHoveredColumn] = useState<number | null>(null);

  const getColumnHoverColor = () => {
    return currentPlayer === 'red' ? 'bg-error/40' : 'bg-warning/40';
  };

  const getPreviewColor = () => {
    return currentPlayer === 'red' ? 'bg-error' : 'bg-warning';
  };

  const findFirstEmptyRow = (column: number): number | null => {
    for (let row = ROWS - 1; row >= 0; row--) {
      if (grid[row][column] === null) {
        return row;
      }
    }
    return null;
  };

  return (
    <div className="bg-primary p-6 rounded-xl shadow-2xl inline-block">
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
        {Array.from({ length: COLS }).map((_, colIndex) => {
          const isEmpty = findFirstEmptyRow(colIndex) !== null;
          const isHovered = hoveredColumn === colIndex && isMyTurn && isEmpty;
          const previewRow = findFirstEmptyRow(colIndex);

          return (
            <div 
              key={colIndex} 
              className="flex flex-col gap-2"
              onMouseEnter={() => isMyTurn && isEmpty && setHoveredColumn(colIndex)}
              onMouseLeave={() => setHoveredColumn(null)}
            >
              <button
                onClick={() => onColumnClick(colIndex)}
                disabled={!isMyTurn || !isEmpty}
                className={`
                  h-14 rounded-t-lg transition-all duration-200
                  flex items-center justify-center
                  ${isMyTurn && isEmpty 
                    ? `${getColumnHoverColor()} cursor-pointer border-2 border-base-100 shadow-lg` 
                    : 'cursor-not-allowed opacity-30 bg-base-100/20'
                  }
                  ${isHovered ? 'scale-105' : ''}
                `}
                aria-label={`Colonne ${colIndex + 1}`}
              >
                {isMyTurn && isEmpty && (
                  <IoArrowDown className={`text-2xl ${currentPlayer === 'red' ? 'text-error' : 'text-warning'}`} />
                )}
              </button>
              <div className="flex flex-col gap-2">
                {Array.from({ length: ROWS }).map((_, rowIndex) => {
                  const showPreview = isHovered && previewRow === rowIndex;
                  const shouldAnimate = lastMove?.row === rowIndex && lastMove?.column === colIndex;
                  return (
                    <div key={rowIndex} className="relative">
                      <Cell value={grid[rowIndex][colIndex]} animate={shouldAnimate} />
                      {showPreview && (
                        <div className={`
                          absolute inset-0 rounded-full border-2 border-dashed
                          ${getPreviewColor()} opacity-50 animate-pulse
                        `} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      {isMyTurn && (
        <div className="mt-4 text-center">
          <p className="text-sm text-base-100">
            Cliquez sur une colonne pour placer votre jeton
          </p>
        </div>
      )}
    </div>
  );
}

