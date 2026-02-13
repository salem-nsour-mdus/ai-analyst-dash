export function FilterToggle({ enabled, onToggle }) {
  return (
    <button
      onClick={() => onToggle(!enabled)}
      className={`
        relative inline-flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-all
        ${enabled 
          ? 'bg-green-600 text-white hover:bg-green-700' 
          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
        }
      `}
    >
      <span className="flex items-center gap-2">
        {enabled ? '✓' : '○'}
        High Confidence Only
      </span>
      {enabled && (
        <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
          >80%
        </span>
      )}
    </button>
  );
}