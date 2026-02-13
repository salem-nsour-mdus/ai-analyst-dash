import { useState } from 'react';

export function InsightModal({ isOpen, onClose, insight, onDelete }) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !insight) return null;

  const getConfidenceColor = (score) => {
    const percent = Math.round(score * 100);
    if (percent >= 80) return 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 border-green-200 dark:border-green-800';
    if (percent >= 60) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
    return 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border-red-200 dark:border-red-800';
  };

  const getTypeIcon = (type) => {
    const icons = {
      text_summary: '📊',
      alert: '⚠️',
      prediction: '🔮',
      recommendation: '💡'
    };
    return icons[type] || '🤖';
  };

  const handleDelete = () => {
    setIsDeleting(true);
    setTimeout(() => {
      onDelete(insight.id);
      onClose();
      setIsDeleting(false);
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Blurred backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-[#0F1219] rounded-2xl shadow-2xl max-w-3xl w-full border border-gray-200 dark:border-gray-800 transform transition-all scale-100">
          
          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
                {getTypeIcon(insight.payload.type)}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                  {insight.payload.type.replace('_', ' ')}
                </h2>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`
                    px-3 py-1 rounded-full text-sm font-mono font-medium
                    ${getConfidenceColor(insight.meta.confidence_score)}
                  `}>
                    {Math.round(insight.meta.confidence_score * 100)}% Confidence
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    ID: {insight.id.substring(0, 8)}...
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Delete Button */}
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-2 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg transition-colors group"
              >
                <span className="text-xl text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                  {isDeleting ? '⏳' : '🗑️'}
                </span>
              </button>
              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <span className="text-xl">✕</span>
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Full Insight Text */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">INSIGHT DETAILS</h3>
              <p className="text-gray-900 dark:text-white text-lg leading-relaxed">
                {insight.payload.content}
              </p>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 dark:bg-[#1A1E26] p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Model Version</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {insight.meta.model_version || 'v2.0'}
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-[#1A1E26] p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Generated</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {insight.meta.generated_at 
                    ? new Date(insight.meta.generated_at).toLocaleDateString()
                    : 'Today'}
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-[#1A1E26] p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                  {insight.status || 'completed'}
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-[#1A1E26] p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Sources</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {insight.payload.sources?.length || 1}
                </p>
              </div>
            </div>

            {/* Sources List */}
            {insight.payload.sources && insight.payload.sources.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">DATA SOURCES</h3>
                <div className="flex flex-wrap gap-2">
                  {insight.payload.sources.map((source, idx) => {
                    const ext = source.split('.').pop().toUpperCase();
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-[#1A1E26] rounded-lg border border-gray-200 dark:border-gray-800"
                      >
                        <span className="text-xl">
                          {ext === 'PDF' && '📄'}
                          {ext === 'SQL' && '🗄️'}
                          {ext === 'XLSX' && '📊'}
                          {ext === 'LOG' && '📝'}
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {source}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Analysis Section */}
            <div className="bg-blue-50 dark:bg-blue-500/5 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
              <h3 className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-2">
                <span>🔍</span> AI ANALYSIS
              </h3>
              <p className="text-blue-900 dark:text-blue-300 text-sm leading-relaxed">
                {insight.meta.confidence_score >= 0.8 
                  ? "This insight has high confidence and can be relied upon for decision-making. The AI has strong evidence supporting this finding."
                  : insight.meta.confidence_score >= 0.6
                  ? "This insight has medium confidence. Consider validating with additional data sources before taking action."
                  : "This insight has low confidence and should be reviewed manually. The AI recommends gathering more data to confirm this finding."}
              </p>
            </div>
          </div>
          
          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-800">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}