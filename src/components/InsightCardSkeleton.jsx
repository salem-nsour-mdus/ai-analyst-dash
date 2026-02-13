export function InsightCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        <div className="flex-1">
          <div className="w-48 h-5 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>

      <div className="w-32 h-8 bg-gray-200 dark:bg-gray-700 rounded-full mb-4"></div>

      <div className="flex gap-2 mb-4">
        <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="w-5/6 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="w-4/6 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>

      <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    </div>
  );
}