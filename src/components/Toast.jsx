import { useEffect } from 'react';

export function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: '🎉',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  const colors = {
    success: 'bg-green-100 dark:bg-green-500/20 border-green-500 text-green-700 dark:text-green-400',
    error: 'bg-red-100 dark:bg-red-500/20 border-red-500 text-red-700 dark:text-red-400',
    warning: 'bg-yellow-100 dark:bg-yellow-500/20 border-yellow-500 text-yellow-700 dark:text-yellow-400',
    info: 'bg-blue-100 dark:bg-blue-500/20 border-blue-500 text-blue-700 dark:text-blue-400'
  };

  return (
    <div className="fixed top-5 right-5 z-[100] animate-slideIn">
      <div className={`${colors[type]} border-2 rounded-lg px-6 py-4 shadow-lg flex items-center gap-3 min-w-[300px]`}>
        <span className="text-2xl">{icons[type]}</span>
        <p className="font-medium flex-1">{message}</p>
        <button onClick={onClose} className="text-lg hover:opacity-70">✕</button>
      </div>
    </div>
  );
}