// export function ChatMessage({ message }) {
//   const isUser = message.type === 'user';

//   return (
//     <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
//       {!isUser && (
//         <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
//           <span className="text-white text-sm">AI</span>
//         </div>
//       )}
      
//       <div className={`flex-1 max-w-[80%] ${isUser ? 'text-right' : ''}`}>
//         <div className="flex items-center gap-2 mb-1">
//           {!isUser && (
//             <>
//               <span className="font-medium text-gray-900 dark:text-white">Assistant</span>
//               <span className="text-xs text-gray-500">{message.timestamp}</span>
//             </>
//           )}
//           {isUser && (
//             <>
//               <span className="text-xs text-gray-500">{message.timestamp}</span>
//               <span className="font-medium text-gray-900 dark:text-white">You</span>
//             </>
//           )}
//         </div>
        
//         <div className={`
//           px-4 py-3 rounded-2xl text-sm
//           ${isUser 
//             ? 'bg-blue-600 text-white rounded-tr-none' 
//             : 'bg-gray-100 dark:bg-[#1A1E26] text-gray-900 dark:text-white rounded-tl-none border border-gray-200 dark:border-gray-700'
//           }
//         `}>
//           <p className="leading-relaxed">{message.message}</p>
//         </div>
//       </div>

//       {isUser && (
//         <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center flex-shrink-0">
//           <span className="text-gray-600 dark:text-gray-300 text-sm">👤</span>
//         </div>
//       )}
//     </div>
//   );
// }

export function ChatMessage({ message }) {
  const isUser = message.type === "user";

  return (
    <div className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      {!isUser && (
        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
          <span className="text-white text-sm">AI</span>
        </div>
      )}

      {/* Wrapper should NOT be flex-1 (that forces width). Keep max width only. */}
      <div className={`${isUser ? "text-right" : ""} max-w-[80%]`}>
        {/* Make the header align properly for user messages */}
        <div className={`flex items-center gap-2 mb-1 ${isUser ? "justify-end" : ""}`}>
          {!isUser ? (
            <>
              <span className="font-medium text-gray-900 dark:text-white">
                Assistant
              </span>
              <span className="text-xs text-gray-500">{message.timestamp}</span>
            </>
          ) : (
            <>
              <span className="text-xs text-gray-500">{message.timestamp}</span>
              <span className="font-medium text-gray-900 dark:text-white">
                You
              </span>
            </>
          )}
        </div>

        {/* Bubble should be inline-block to fit content width, with wrapping rules */}
        <div
          className={`
            inline-block px-4 py-3 rounded-2xl text-sm
            max-w-full break-words whitespace-pre-wrap
            ${isUser
              ? "bg-blue-600 text-white rounded-tr-none"
              : "bg-gray-100 dark:bg-[#1A1E26] text-gray-900 dark:text-white rounded-tl-none border border-gray-200 dark:border-gray-700"}
          `}
        >
          <p className="leading-relaxed">{message.message}</p>
        </div>
      </div>

      {isUser && (
        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center flex-shrink-0">
          <span className="text-gray-600 dark:text-gray-300 text-sm">👤</span>
        </div>
      )}
    </div>
  );
}
