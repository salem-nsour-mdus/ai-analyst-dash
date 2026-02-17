export function PinnedSidebar({ pinnedItems = [], onItemClick }) {
  if (pinnedItems.length === 0) {
    return (
      <div className="bg-white dark:bg-[#0F1219] rounded-2xl border border-gray-200 dark:border-gray-800 p-6 sticky top-24">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="text-blue-600 dark:text-blue-400">📌</span>
            Pinned Insights
          </h3>
        </div>
        
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl text-gray-400 dark:text-gray-600">📌</span>
          </div>
          <p className="text-gray-900 dark:text-white font-medium mb-1">
            No insights pinned
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Click the pin icon on any insight to save it here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0F1219] rounded-2xl border border-gray-200 dark:border-gray-800 p-6 sticky top-24">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-800">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="text-blue-600 dark:text-blue-400">📌</span>
          Pinned Insights
        </h3>
        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-full">
          {pinnedItems.length}
        </span>
      </div>

      <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto pr-1 custom-scrollbar">
        {pinnedItems.map((item) => {
          const confidence = Math.round(item.meta.confidence_score * 100);
          return (
            <button
              key={item.id}
              onClick={() => onItemClick(item)}
              className="w-full text-left p-4 bg-gray-50 dark:bg-[#1A1E26] rounded-xl border-l-4 border-l-blue-500 dark:border-l-blue-400 hover:bg-gray-100 dark:hover:bg-[#1E222A] transition-all group"
            >
              <div className="flex items-start justify-between mb-2">
                <span className="font-medium text-gray-900 dark:text-white text-sm line-clamp-1 flex-1 pr-2">
                  {item.payload.type === 'text_summary' 
                    ? 'Revenue Anomaly' 
                    : item.payload.type === 'alert'
                    ? 'Sentiment Analysis'
                    : item.payload.type === 'prediction'
                    ? 'User Behavior'
                    : 'Market Trend'}
                </span>
                {/* Confidence Badge - Color Coded Green/Yellow/Red */}
                <span className={`
                  text-xs px-2 py-1 rounded-full font-medium flex-shrink-0
                  ${confidence >= 80 
                    ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                    : confidence >= 60
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                  }
                `}>
                  {confidence}%
                </span>
              </div>
              
              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2 leading-relaxed">
                {item.payload.content}
              </p>
              
              {item.payload.sources && item.payload.sources.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {item.payload.sources.slice(0, 2).map((source, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md font-medium"
                    >
                      {source.split('.').pop().toUpperCase()}
                    </span>
                  ))}
                  {item.payload.sources.length > 2 && (
                    <span className="text-[10px] text-gray-500 dark:text-gray-500">
                      +{item.payload.sources.length - 2}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}