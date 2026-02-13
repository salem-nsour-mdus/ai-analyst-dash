import { useState } from 'react';

export function ChatBox({ onSendMessage, disabled = false }) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 dark:border-gray-800 p-4 bg-gray-50 dark:bg-[#0A0D14]">
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={disabled ? "Initializing Gemini AI..." : "Ask Gemini about your data..."}
          disabled={disabled}
          className="flex-1 px-4 py-3 bg-white dark:bg-[#1A1E26] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className="px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white font-medium rounded-xl text-sm transition-colors disabled:cursor-not-allowed flex items-center gap-2"
        >
          <span>Send</span>
          <span className="text-lg">→</span>
        </button>
      </div>
      <div className="flex items-center justify-between mt-2">
        <p className="text-xs text-gray-500 dark:text-gray-500 ml-1">
          Ask about trends, anomalies, predictions, or specific insights
        </p>
        {disabled && (
          <p className="text-xs text-yellow-600 dark:text-yellow-500 animate-pulse">
            ⚡ Connecting to Gemini...
          </p>
        )}
      </div>
    </form>
  );
}