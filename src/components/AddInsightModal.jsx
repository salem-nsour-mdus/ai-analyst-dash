import { useState } from 'react';

export function AddInsightModal({ isOpen, onClose, onAdd }) {
  const [formData, setFormData] = useState({
    type: 'text_summary',
    content: '',
    confidence: 85,
    sources: [],
    sourceInput: ''
  });

  if (!isOpen) return null;

  const handleAddSource = () => {
    if (formData.sourceInput.trim()) {
      setFormData({
        ...formData,
        sources: [...formData.sources, formData.sourceInput],
        sourceInput: ''
      });
    }
  };

  const handleSubmit = () => {
    const newInsight = {
      id: `uuid-${Date.now()}`,
      meta: {
        generated_at: new Date().toISOString(),
        model_version: "v2.1",
        confidence_score: formData.confidence / 100
      },
      payload: {
        type: formData.type,
        content: formData.content,
        sources: formData.sources.length > 0 ? formData.sources : ['manual_entry.txt']
      },
      status: "completed"
    };
    
    onAdd(newInsight);
    onClose();
    
    // Reset form
    setFormData({
      type: 'text_summary',
      content: '',
      confidence: 85,
      sources: [],
      sourceInput: ''
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Blurred backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-[#0F1219] rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-200 dark:border-gray-800 transform transition-all">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add New Insight</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Create a custom insight to add to your dashboard
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <span className="text-xl">✕</span>
            </button>
          </div>
          
          {/* Form */}
          <div className="p-6 space-y-6">
            {/* Insight Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Insight Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                {['text_summary', 'alert', 'prediction', 'recommendation'].map(type => (
                  <label key={type} className={`
                    flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors
                    ${formData.type === type 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10' 
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }
                  `}>
                    <input
                      type="radio"
                      name="type"
                      value={type}
                      checked={formData.type === type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="sr-only"
                    />
                    <span className="text-2xl mr-2">
                      {type === 'text_summary' && '📊'}
                      {type === 'alert' && '⚠️'}
                      {type === 'prediction' && '🔮'}
                      {type === 'recommendation' && '💡'}
                    </span>
                    <span className="text-sm text-gray-900 dark:text-white capitalize">
                      {type.replace('_', ' ')}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Insight Content
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                rows={4}
                className="w-full px-4 py-3 bg-white dark:bg-[#1A1E26] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                placeholder="Describe your insight in detail..."
              />
            </div>

            {/* Confidence Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confidence Score
                </label>
                <span className={`
                  px-3 py-1 rounded-full text-sm font-mono
                  ${formData.confidence >= 80 ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' :
                    formData.confidence >= 60 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400' :
                    'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'}
                `}>
                  {formData.confidence}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.confidence}
                onChange={(e) => setFormData({...formData, confidence: parseInt(e.target.value)})}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>Low</span>
                <span>Medium</span>
                <span>High</span>
              </div>
            </div>

            {/* Sources */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Data Sources
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={formData.sourceInput}
                  onChange={(e) => setFormData({...formData, sourceInput: e.target.value})}
                  placeholder="e.g., sales_data.pdf, customer_feedback.sql"
                  className="flex-1 px-4 py-2 bg-white dark:bg-[#1A1E26] border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSource()}
                />
                <button
                  onClick={handleAddSource}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Add
                </button>
              </div>
              
              {/* Source tags */}
              {formData.sources.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.sources.map((source, index) => {
                    const ext = source.split('.').pop().toUpperCase();
                    return (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 rounded-full text-sm"
                      >
                        {ext}
                        <button
                          onClick={() => setFormData({
                            ...formData,
                            sources: formData.sources.filter((_, i) => i !== index)
                          })}
                          className="ml-1 hover:text-blue-900 dark:hover:text-blue-300"
                        >
                          ✕
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          
          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-800">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!formData.content.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <span>✨</span>
              Add Insight
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}