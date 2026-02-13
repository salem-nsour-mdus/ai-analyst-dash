import { useInsights } from './hooks/useInsights';
import { InsightCard } from './components/InsightCard';
import { InsightCardSkeleton } from './components/InsightCardSkeleton';
import { ErrorCard } from './components/ErrorCard';
import { PinnedSidebar } from './components/PinnedSidebar';
import { FilterToggle } from './components/FilterToggle';
import { ThemeToggle } from './components/ThemeToggle';
import { ChatBox } from './components/ChatBox';
import { ChatMessage } from './components/ChatMessage';
import { AddInsightModal } from './components/AddInsightModal';
import { InsightModal } from './components/InsightModal';
import { StatModal } from './components/StatModal';
import { Toast } from './components/Toast';
import { FloatingAssistant } from './components/FloatingAssistant';
import { geminiService } from './services/geminiService';
import { useState, useEffect } from 'react';

function App() {
  const {
    insights,
    pinnedInsights,
    loading,
    error,
    showHighConfidence,
    setShowHighConfidence,
    togglePin,
    isPinned,
    refetch
  } = useInsights();

  // Remove the second insight (uuid-5678) from display
  const filteredOriginalInsights = insights.filter(i => i.id !== "uuid-5678");

  // Chat states
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      message: '👋 Hello! I\'m your AI analyst. Ask me anything about your data - sales trends, anomalies, predictions, or customer insights.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [isChatLoading, setIsChatLoading] = useState(false);
  const [geminiInitialized, setGeminiInitialized] = useState(false);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [customInsights, setCustomInsights] = useState([]);
  const [selectedInsight, setSelectedInsight] = useState(null);
  const [isInsightModalOpen, setIsInsightModalOpen] = useState(false);
  const [selectedStat, setSelectedStat] = useState(null);
  const [isStatModalOpen, setIsStatModalOpen] = useState(false);

  // Toast states
  const [toast, setToast] = useState(null);

  // Initialize Gemini with insights data
useEffect(() => {
  if (filteredOriginalInsights.length > 0 && !geminiInitialized) {
    geminiService.initializeWithData(filteredOriginalInsights);
    setGeminiInitialized(true);
    
    setTimeout(() => {
      const avgConf = Math.round(filteredOriginalInsights.reduce((acc, i) => acc + i.meta.confidence_score, 0) / filteredOriginalInsights.length * 100);
      const dataMessage = {
        id: chatMessages.length + 1,
        type: 'assistant',
        message: `✅ I've loaded ${filteredOriginalInsights.length} insights with an average confidence of ${avgConf}%. I can help you analyze trends, identify patterns, or answer specific questions about your data.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, dataMessage]);
    }, 1000);
  }
}, [filteredOriginalInsights, geminiInitialized, chatMessages.length]);

  const handleSendMessage = async (message) => {
    if (!message.trim()) return;

    const userMessage = {
      id: chatMessages.length + 1,
      type: 'user',
      message: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, userMessage]);
    
    setIsChatLoading(true);
    
    try {
      const aiResponse = await geminiService.sendMessage(message, filteredOriginalInsights);
      
      const responseMessage = {
        id: chatMessages.length + 2,
        type: 'assistant',
        message: aiResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, responseMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      
      const errorMessage = {
        id: chatMessages.length + 2,
        type: 'assistant',
        message: `❌ Sorry, I encountered an error. Please try again.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleClearChat = () => {
    geminiService.clearHistory();
    setChatMessages([
      {
        id: 1,
        type: 'assistant',
        message: '👋 Chat cleared! Ask me anything about your data.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleAddInsight = (newInsight) => {
    setCustomInsights(prev => [newInsight, ...prev]);
    // Show celebration toast
    setToast({
      type: 'success',
      message: '🎉 Insight added successfully! Great work!'
    });
  };

  const handleDeleteInsight = (insightId) => {
    // Remove from custom insights if it's a custom one
    if (insightId.startsWith('uuid-') && !insightId.startsWith('uuid-1234')) {
      setCustomInsights(prev => prev.filter(i => i.id !== insightId));
    } else {
      // For original insights, we'll just show a message since they're from mock API
      setToast({
        type: 'info',
        message: 'Original insights cannot be deleted, but you can hide them with filters!'
      });
      return;
    }
    
    // Show delete confirmation toast
    setToast({
      type: 'warning',
      message: '🗑️ Insight deleted successfully'
    });
  };

  const handleInsightClick = (insight) => {
    setSelectedInsight(insight);
    setIsInsightModalOpen(true);
  };

  const handleStatClick = (statType, data) => {
    setSelectedStat({ type: statType, data });
    setIsStatModalOpen(true);
  };

  const handlePinnedClick = (insight) => {
    setSelectedInsight(insight);
    setIsInsightModalOpen(true);
    const element = document.getElementById(`insight-${insight.id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.style.transition = 'background-color 0.3s ease';
      element.style.backgroundColor = 'rgb(239, 246, 255)';
      setTimeout(() => {
        element.style.backgroundColor = '';
      }, 1000);
    }
  };

  // Stats calculations - accurate numbers
  const allDisplayInsights = [...customInsights, ...filteredOriginalInsights];
  const filteredDisplayInsights = showHighConfidence
    ? allDisplayInsights.filter(i => i.meta.confidence_score > 0.8)
    : allDisplayInsights;
  
  const totalInsights = allDisplayInsights.length;
  const avgConfidence = allDisplayInsights.length > 0
    ? Math.round(allDisplayInsights.reduce((acc, i) => acc + i.meta.confidence_score, 0) / allDisplayInsights.length * 100)
    : 0;
  const highConfidenceCount = allDisplayInsights.filter(i => i.meta.confidence_score > 0.8).length;
  const activeSources = [...new Set(allDisplayInsights.flatMap(i => 
    i.payload.sources?.map(s => s.split('.').pop().toUpperCase()) || []
  ))].length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0E14] transition-colors duration-200">
      {/* Toast notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Floating Assistant */}
      <FloatingAssistant />

      {/* Header */}
      <header className="bg-white dark:bg-[#0F1219]/95 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <span className="text-white text-xl">✨</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  AI Analyst Dashboard
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Powered by Google Gemini AI
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <FilterToggle 
                enabled={showHighConfidence}
                onToggle={setShowHighConfidence}
              />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Chat Section - Top */}
        <div className="mb-8">
          {error ? (
            <ErrorCard 
              message={error}
              source="SQL Database"
              onRetry={refetch}
            />
          ) : (
            <div className="bg-white dark:bg-[#0F1219] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">AI</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Gemini Analyst</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {geminiInitialized ? '🟢 Connected' : '🟡 Initializing...'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClearChat}
                  className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Clear chat
                </button>
              </div>

              {/* Chat Messages */}
              <div className="p-6 pb-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                <div className="space-y-4">
                  {chatMessages.map(msg => (
                    <ChatMessage key={msg.id} message={msg} />
                  ))}
                  {isChatLoading && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                        <span className="text-white text-sm">AI</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900 dark:text-white">Gemini</span>
                          <span className="text-xs text-gray-500">thinking...</span>
                        </div>
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                          <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                          <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Chat Input */}
              <ChatBox onSendMessage={handleSendMessage} disabled={!geminiInitialized} />
            </div>
          )}
        </div>

        {/* Stats Overview - Accurate numbers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div 
            onClick={() => handleStatClick('total', totalInsights)}
            className="bg-white dark:bg-[#0F1219] rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer group"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Insights</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalInsights}</p>
              </div>
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-500/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-blue-600 dark:text-blue-400 text-xl">📊</span>
              </div>
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
              <span>↑</span> {highConfidenceCount} high confidence
            </p>
          </div>

          <div 
            onClick={() => handleStatClick('avg', avgConfidence)}
            className="bg-white dark:bg-[#0F1219] rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer group"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Avg. Confidence</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{avgConfidence}%</p>
              </div>
              <div className="w-10 h-10 bg-green-50 dark:bg-green-500/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-green-600 dark:text-green-400 text-xl">📈</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {avgConfidence >= 80 ? 'Excellent' : avgConfidence >= 60 ? 'Good' : 'Needs improvement'}
            </p>
          </div>

          <div 
            onClick={() => handleStatClick('sources', activeSources)}
            className="bg-white dark:bg-[#0F1219] rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer group"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Active Sources</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{activeSources || 3}</p>
              </div>
              <div className="w-10 h-10 bg-purple-50 dark:bg-purple-500/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-purple-600 dark:text-purple-400 text-xl">🗄️</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              PDF, SQL, Web
            </p>
          </div>
        </div>

        {/* Insights Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed - 2 columns */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Latest Insights
              </h2>
              <div className="flex items-center gap-3">
                {showHighConfidence && (
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
                    High confidence only
                  </span>
                )}
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-all hover:scale-105 flex items-center gap-2"
                >
                  <span className="text-lg">✨</span>
                  Add Insight
                </button>
              </div>
            </div>

            {error ? (
              <ErrorCard message={error} onRetry={refetch} />
            ) : (
              <div className="space-y-6">
                {loading ? (
                  Array(3).fill().map((_, i) => (
                    <InsightCardSkeleton key={i} />
                  ))
                ) : filteredDisplayInsights.length > 0 ? (
                  filteredDisplayInsights.map(insight => (
                    <div key={insight.id} id={`insight-${insight.id}`}>
                      <InsightCard
                        insight={insight}
                        isPinned={isPinned(insight.id)}
                        onPinClick={togglePin}
                        onClick={() => handleInsightClick(insight)}
                      />
                    </div>
                  ))
                ) : (
                  <div className="bg-white dark:bg-[#0F1219] rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center">
                    <span className="text-4xl mb-4 block">🔍</span>
                    <p className="text-gray-600 dark:text-gray-400 font-medium">
                      No insights found
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                      Try adjusting the confidence filter
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar - 1 column */}
          <div className="lg:col-span-1">
            <PinnedSidebar 
              pinnedItems={pinnedInsights}
              onItemClick={handlePinnedClick}
            />
          </div>
        </div>
      </main>

      {/* Modals */}
      <AddInsightModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddInsight}
      />

      <InsightModal
        isOpen={isInsightModalOpen}
        onClose={() => setIsInsightModalOpen(false)}
        insight={selectedInsight}
        onDelete={handleDeleteInsight}
      />

      <StatModal
        isOpen={isStatModalOpen}
        onClose={() => setIsStatModalOpen(false)}
        stat={selectedStat}
      />
    </div>
  );
}

export default App;