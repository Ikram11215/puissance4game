"use client";

import { useEffect, useState } from "react";
import { IoClose, IoInformationCircle, IoCheckmarkCircle, IoWarning, IoAlertCircle } from "react-icons/io5";

export type ToastType = 'info' | 'success' | 'warning' | 'error';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose?: () => void;
}

export default function Toast({ message, type = 'info', duration = 5000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose?.(), 300);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    info: <IoInformationCircle className="text-2xl" />,
    success: <IoCheckmarkCircle className="text-2xl" />,
    warning: <IoWarning className="text-2xl" />,
    error: <IoAlertCircle className="text-2xl" />,
  };

  const colors = {
    info: 'bg-info/20 border-info text-info-content',
    success: 'bg-success/20 border-success text-success-content',
    warning: 'bg-warning/20 border-warning text-warning-content',
    error: 'bg-error/20 border-error text-error-content',
  };

  return (
    <div
      className={`
        fixed top-4 right-4 z-50
        flex items-center gap-3
        px-6 py-4 rounded-2xl
        border-2 backdrop-blur-md
        shadow-2xl
        transform transition-all duration-300 ease-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${colors[type]}
        min-w-[300px] max-w-md
      `}
    >
      <div className="flex-shrink-0">
        {icons[type]}
      </div>
      <p className="flex-1 font-semibold text-sm">{message}</p>
      {onClose && (
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onClose(), 300);
          }}
          className="flex-shrink-0 hover:opacity-70 transition-opacity"
        >
          <IoClose className="text-xl" />
        </button>
      )}
    </div>
  );
}

