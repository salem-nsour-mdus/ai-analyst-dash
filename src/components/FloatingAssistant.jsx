import { useState, useEffect, useRef, useMemo } from 'react';

export function FloatingAssistant() {
  const [isHovering, setIsHovering] = useState(false);
  const [message, setMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const [waveOffset, setWaveOffset] = useState(0);
  const assistantRef = useRef(null);
  const timeoutRef = useRef(null);

  const tips = useMemo(() => ([
    "💡 Click on any insight to see details and delete it",
    "📌 Pin important insights to save them in the sidebar",
    "✨ Add your own insights with the 'Add Insight' button",
    "🔍 Filter high confidence insights (>80%) with the toggle",
    "🌓 Toggle dark/light mode for comfortable viewing",
    "📊 Click on stats cards for detailed analysis",
    "🗑️ Delete insights you don't need anymore",
    "🎉 Celebrate when you add new insights!",
    "👋 Need help? Just click on me!",
    "🤖 I'm here to guide you through the dashboard"
  ]), []);

  useEffect(() => {
    // Gentle wave animation
    const waveInterval = setInterval(() => {
      setWaveOffset(prev => (prev + 1) % 4);
    }, 500);

    // Show random tip every 30 seconds
    const showRandomTip = () => {
      const randomTip = tips[Math.floor(Math.random() * tips.length)];
      setMessage(randomTip);
      setShowMessage(true);

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setShowMessage(false);
      }, 5000);
    };

    // Show first tip after 10 seconds
    const initialTimeout = setTimeout(showRandomTip, 10000);

    // Set interval for subsequent tips
    const interval = setInterval(showRandomTip, 30000);

    // React to mouse movement with subtle head turn
    const handleMouseMove = (e) => {
      if (!assistantRef.current) return;

      const rect = assistantRef.current.getBoundingClientRect();
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      // Calculate if mouse is near the assistant
      const distance = Math.sqrt(
        Math.pow(mouseX - (rect.left + 40), 2) +
        Math.pow(mouseY - (rect.top + 40), 2)
      );

      if (distance < 200) {
        // Subtle scale when mouse is near
        assistantRef.current.style.transform = 'scale(1.05)';
      } else {
        assistantRef.current.style.transform = 'scale(1)';
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      clearInterval(waveInterval);
      clearTimeout(initialTimeout);
      clearInterval(interval);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [tips]);

  const handleClick = () => {
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    setMessage(randomTip);
    setShowMessage(true);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setShowMessage(false);
    }, 5000);

    // Happy bounce animation
    if (assistantRef.current) {
      assistantRef.current.style.transform = 'scale(1.2)';
      setTimeout(() => {
        if (assistantRef.current) {
          assistantRef.current.style.transform = 'scale(1)';
        }
      }, 200);
    }
  };

  // Wave animation based on offset
  const getWaveEmoji = () => {
    const waves = ['👋', '✋', '🤚', '🖐️'];
    return waves[waveOffset];
  };

  return (
    <div
      ref={assistantRef}
      className="fixed bottom-6 right-6 z-50 cursor-pointer transition-all duration-300 ease-in-out group"
      style={{
        transform: isHovering ? 'scale(1.1)' : 'scale(1)'
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={handleClick}
    >
      {/* Speech bubble */}
      {showMessage && (
        <div className="absolute bottom-full right-0 mb-4 w-72 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 border-2 border-blue-500 relative">
            <p className="text-sm text-gray-800 dark:text-gray-200">{message}</p>
            <div className="absolute bottom-[-8px] right-6 w-4 h-4 bg-white dark:bg-gray-800 border-r-2 border-b-2 border-blue-500 transform rotate-45"></div>
          </div>
        </div>
      )}

      {/* Assistant character */}
      <div className="relative">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl group-hover:shadow-blue-500/50 transition-shadow">
          <span className="text-4xl animate-float">
            {isHovering ? getWaveEmoji() : '🤖'}
          </span>
        </div>

        {/* Status indicator */}
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></div>

        {/* Small floating dots for effect */}
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 flex gap-1">
          <span className="w-1 h-1 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
          <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
          <span className="w-1 h-1 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
        </div>

        {/* Hover tooltip */}
        {isHovering && !showMessage && (
          <div className="absolute bottom-full right-0 mb-2 whitespace-nowrap bg-gray-900 text-white text-sm px-3 py-1.5 rounded-lg animate-fadeIn">
            Click me for tips! 👆
          </div>
        )}
      </div>

      {/* Small glow effect */}
      <div className="absolute inset-0 bg-blue-500 rounded-full filter blur-xl opacity-20 group-hover:opacity-30 transition-opacity -z-10"></div>
    </div>
  );
}
