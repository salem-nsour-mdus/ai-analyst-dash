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
import { FloatingAssistant } from './components/FloatingAssistant';
import { geminiService } from './services/geminiService';
import { useState, useEffect, useRef } from 'react';

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

  // Scroll animation state
  const [scrollY, setScrollY] = useState(0);
  const [showHeaderContent, setShowHeaderContent] = useState(false);
  const [, setShowStats] = useState(false);
  const headerRef = useRef(null);
  const heroRef = useRef(null);
  const statsRef = useRef(null);

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

  // Chat container ref for auto-scroll
  const chatContainerRef = useRef(null);

  // Handle scroll for hero animation
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);
      
      // Show header content when scrolled past hero
      if (currentScrollY > 100) {
        setShowHeaderContent(true);
      } else {
        setShowHeaderContent(false);
      }
      
      // Show stats when hero starts fading (between 50px and 400px scroll)
      if (currentScrollY > 50 && currentScrollY < 400) {
        setShowStats(true);
      } else {
        setShowStats(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

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

  // Calculate hero title size and position based on scroll
  const heroTitleSize = Math.max(1.5, 4 - scrollY * 0.02);
  const heroTitleOpacity = Math.max(0, 1 - scrollY * 0.01);
  const heroTitleY = Math.max(0, scrollY * 0.5);

  // Calculate info boxes opacity based on scroll
  const infoBoxesOpacity = Math.min(1, Math.max(0, (scrollY - 50) / 200));

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0E14] transition-colors duration-200">
      {/* Hero Section - Full Screen Cover */}
      <section 
        ref={heroRef}
        className="fixed top-0 left-0 w-full h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-900 dark:via-indigo-900 dark:to-purple-900 z-40 pointer-events-none"
        style={{
          opacity: heroTitleOpacity,
          transform: `translateY(${heroTitleY}px)`
        }}
      >
        <div className="text-center px-4">
          <h1 
            className="font-bold text-white mb-4 transition-all duration-300"
            style={{
              fontSize: `${heroTitleSize}rem`,
              lineHeight: '1.2'
            }}
          >
            AI Analyst Dashboard
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Powered by Google Gemini AI
          </p>
          <div className="mt-8 flex gap-4 justify-center">
            <div className="w-3 h-3 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <p className="text-white/60 text-sm mt-8">Scroll down to explore</p>
        </div>
      </section>

      {/* Header */}
      <header 
        ref={headerRef}
        className="fixed top-0 left-0 w-full bg-white dark:bg-[#0F1219]/95 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 z-50 transition-all duration-300"
        style={{
          transform: showHeaderContent ? 'translateY(0)' : 'translateY(-100%)',
          opacity: showHeaderContent ? 1 : 0
        }}
      >
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

      {/* Spacer for hero section */}
      <div className="h-screen"></div>

      {/* Animated Info Boxes - Appear as hero fades */}
      <div 
        ref={statsRef}
        className="max-w-7xl mx-auto px-6 transition-all duration-700"
        style={{
          opacity: infoBoxesOpacity,
          transform: `translateY(${30 * (1 - infoBoxesOpacity)}px)`,
          marginTop: '-80px',
          marginBottom: '50px'
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Box 1: AI-Powered Analytics */}
          <div className="group perspective">
            <div className="relative bg-gradient-to-br from-purple-500 to-indigo-600 dark:from-purple-600 dark:to-indigo-700 rounded-2xl p-8 shadow-xl hover:shadow-2xl transform transition-all duration-500 hover:scale-105 hover:-translate-y-2 cursor-pointer overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-8 -mb-8 group-hover:scale-150 transition-transform duration-700"></div>
              
              {/* Content */}
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-300">
                  <span className="text-3xl">🤖</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">AI-Powered Analytics</h3>
                <p className="text-white/80 leading-relaxed">
                  Real-time insights generated by Google Gemini AI. Ask questions, get answers, and make data-driven decisions instantly.
                </p>
                <div className="mt-6 flex items-center gap-2 text-white/60 text-sm">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <span>Active 24/7</span>
                </div>
              </div>
              
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          </div>

          {/* Box 2: Smart Insights */}
          <div className="group perspective">
            <div className="relative bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-700 rounded-2xl p-8 shadow-xl hover:shadow-2xl transform transition-all duration-500 hover:scale-105 hover:-translate-y-2 cursor-pointer overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-10 -mt-10 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-8 -mb-8 group-hover:scale-150 transition-transform duration-700"></div>
              
              {/* Content */}
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-300">
                  <span className="text-3xl">💡</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Smart Insights</h3>
                <p className="text-white/80 leading-relaxed">
                  Color-coded confidence scores (🟢 High, 🟡 Medium, 🔴 Low) help you prioritize what matters most.
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <span className="px-2 py-1 bg-green-500/30 backdrop-blur-sm rounded-full text-xs text-white">80-100%</span>
                  <span className="px-2 py-1 bg-yellow-500/30 backdrop-blur-sm rounded-full text-xs text-white">60-79%</span>
                  <span className="px-2 py-1 bg-red-500/30 backdrop-blur-sm rounded-full text-xs text-white">0-59%</span>
                </div>
              </div>
              
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          </div>

          {/* Box 3: Interactive Features */}
          <div className="group perspective">
            <div className="relative bg-gradient-to-br from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-700 rounded-2xl p-8 shadow-xl hover:shadow-2xl transform transition-all duration-500 hover:scale-105 hover:-translate-y-2 cursor-pointer overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-8 -mb-8 group-hover:scale-150 transition-transform duration-700"></div>
              
              {/* Content */}
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-300">
                  <span className="text-3xl">🎯</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Interactive Features</h3>
                <p className="text-white/80 leading-relaxed">
                  Pin important insights, add your own data, delete what you don't need. Everything updates in real-time.
                </p>
                <div className="mt-6 flex items-center gap-4 text-white/60 text-sm">
                  <span className="flex items-center gap-1">📌 Pin</span>
                  <span className="flex items-center gap-1">✨ Add</span>
                  <span className="flex items-center gap-1">🗑️ Delete</span>
                </div>
              </div>
              
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          </div>
        </div>
        
        {/* Small scroll indicator */}
        <div className="flex justify-center mt-8">
          <div className="flex gap-2">
            <div className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full animate-pulse" style={{ animationDelay: '400ms' }}></div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8 relative z-30 bg-[#F8FAFC] dark:bg-[#0B0E14]">
        {/* Chat Section - Top with fixed height and scroll */}
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

              {/* Chat Messages - Fixed height with auto-scroll */}
              <div 
                ref={chatContainerRef}
                className="p-6 h-[400px] overflow-y-auto custom-scrollbar"
              >
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

        {/* Stats Overview - 3 Cards (for below chat) */}
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
                <p className={`text-3xl font-bold ${
                  avgConfidence >= 80 ? 'text-green-600 dark:text-green-400' :
                  avgConfidence >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
                  'text-red-600 dark:text-red-400'
                }`}>
                  {avgConfidence}%
                </p>
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

      {/* Floating Assistant */}
      <FloatingAssistant />

      {/* Modals */}
      {isAddModalOpen && (
        <AddInsightModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddInsight}
        />
      )}

      {isInsightModalOpen && (
        <InsightModal
          isOpen={isInsightModalOpen}
          onClose={() => setIsInsightModalOpen(false)}
          insight={selectedInsight}
          onDelete={() => {}}
        />
      )}

      {isStatModalOpen && (
        <StatModal
          isOpen={isStatModalOpen}
          onClose={() => setIsStatModalOpen(false)}
          stat={selectedStat}
        />
      )}
    </div>
  );
}

export default App;