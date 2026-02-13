export function ErrorCard({ message, source = 'SQL Database', onRetry }) {
  return (
    <div className="bg-white dark:bg-[#0F1219] rounded-2xl border border-red-200 dark:border-red-900/50 overflow-hidden shadow-sm">
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-500/10 rounded-2xl flex items-center justify-center flex-shrink-0">
            <span className="text-red-600 dark:text-red-400 text-2xl">⚠️</span>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">
                Error Occurred
              </h3>
              <span className="px-2 py-1 bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 text-xs font-medium rounded-full">
                Source: {source}
              </span>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">
              {message || `Source disconnected. Unable to establish connection with the ${source} server. The AI cannot generate insights without access to the data source. Please verify your database credentials and network connection.`}
            </p>
            
            <button
              onClick={onRetry}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg text-sm transition-colors inline-flex items-center gap-2"
            >
              <span>⟳</span>
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}