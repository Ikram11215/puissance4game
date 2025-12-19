import type { CellValue } from "@/lib/game/types";

interface CellProps {
  value: CellValue;
  onClick?: () => void;
  isClickable?: boolean;
  animate?: boolean;
}

export default function Cell({ value, onClick, isClickable = false, animate = false }: CellProps) {
  const getCellColor = () => {
    if (value === 'red') return 'bg-error';
    if (value === 'yellow') return 'bg-warning';
    return 'bg-base-100';
  };

  return (
    <button
      onClick={onClick}
      disabled={!isClickable}
      className={`
        w-12 h-12 rounded-full border-2 border-base-300
        ${getCellColor()}
        ${isClickable ? 'hover:opacity-80 cursor-pointer' : 'cursor-default'}
        transition-all duration-200
        ${animate ? 'animate-drop' : ''}
      `}
    >
    </button>
  );
}

