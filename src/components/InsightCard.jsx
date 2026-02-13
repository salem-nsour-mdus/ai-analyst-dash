export function InsightCard({ insight, isPinned, onPinClick, onClick }) {
  const getConfidenceColor = (score) => {
    const percent = Math.round(score * 100);
    if (percent >= 80) return 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 border-green-200 dark:border-green-800';
    if (percent >= 60) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
    return 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border-red-200 dark:border-red-800';
  };

  

  const getSourceColor = (source) => {
    const ext = source.split('.').pop().toUpperCase();
    const colors = {
      PDF: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400 border-orange-200 dark:border-orange-800',
      SQL: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200 dark:border-blue-800',
      XLSX: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
      LOG: 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400 border-gray-200 dark:border-gray-700',
      WEB: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 border-purple-200 dark:border-purple-800'
    };
    return colors[ext] || 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400';
  };

  const confidenceScore = Math.round(insight.meta.confidence_score * 100);
  
  // Get title based on type
  const getTitle = () => {
    switch(insight.payload.type) {
      case 'text_summary':
        return 'AI Detected Revenue Anomaly Pattern';
      case 'alert':
        return 'Natural Language Processing: Customer Sentiment Analysis';
      case 'prediction':
        return 'Machine Learning: User Behavior Prediction';
      case 'recommendation':
        return 'AI-Powered Market Trend Forecast';
      default:
        return insight.payload.type.replace('_', ' ').toUpperCase();
    }
  };

  // Format date properly
  const formatDate = (dateString) => {
    if (!dateString) return new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div 
      onClick={onClick}
      className={`
        relative bg-white dark:bg-[#0F1219] rounded-2xl border 
        ${isPinned 
          ? 'border-l-4 border-l-blue-500 dark:border-l-blue-400 border-gray-200 dark:border-gray-800' 
          : 'border-gray-200 dark:border-gray-800'
        }
        p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group
      `}
    >
      {/* Pin Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onPinClick(insight);
        }}
        className={`
          absolute top-6 right-6 p-2 rounded-lg transition-all duration-300 z-10
          ${isPinned 
            ? 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50' 
            : 'text-gray-400 hover:text-gray-600 dark:text-gray-600 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }
          group-hover:scale-110 group-hover:rotate-12
        `}
      >
        <span className="text-xl">{isPinned ? '📍' : '📌'}</span>
      </button>

      {/* Header */}
      <div className="pr-12 mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">
          {getTitle()}
        </h3>
      </div>

      {/* Confidence Badge */}
      <div className="mb-4 transform transition-all duration-300 group-hover:scale-105 group-hover:translate-x-1">
        <span className={`
          inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border
          ${getConfidenceColor(confidenceScore)}
        `}>
          {confidenceScore}% Confidence
        </span>
      </div>

      {/* Source Tags */}
      {insight.payload.sources && insight.payload.sources.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {insight.payload.sources.map((source, index) => {
            const ext = source.split('.').pop().toUpperCase();
            return (
              <span
                key={index}
                className={`
                  px-2.5 py-1 text-xs font-medium rounded-md border
                  ${getSourceColor(source)}
                  transform transition-all duration-300 hover:scale-110 hover:-translate-y-1
                `}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {ext}
              </span>
            );
          })}
        </div>
      )}

      {/* Content */}
      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4 line-clamp-3">
        {insight.payload.content}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-500">
            Model
          </span>
          <span className="text-xs text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
            {insight.meta.model_version || 'v2.0'}
          </span>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-500">
          {formatDate(insight.meta.generated_at)}
        </span>
      </div>

      {/* Processing Indicator - Only if status is processing */}
      {insight.status === 'processing' && (
        <div className="absolute bottom-6 right-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
        </div>
      )}
    </div>
  );
}