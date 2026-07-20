import fs from 'fs';
let content = fs.readFileSync('src/components/community/ChatRoom.tsx', 'utf-8');

// 1. Update useMessages import destructuring
content = content.replace(
  "const { messages, loading, sendMessage, editMessage, deleteMessage, reactToMessage } = useMessages(thread);",
  "const { messages, loading, sendMessage, editMessage, deleteMessage, reactToMessage, setTypingStatus } = useMessages(thread);"
);

// 2. Add typing indicator component inside ChatRoom messages area
const typingComponent = `
        {/* Typing Indicator */}
        {(thread.typingUsers || []).filter(uid => uid !== user?.uid).length > 0 && (
          <div className="flex gap-2 items-center p-4 text-black/50 dark:text-white/50 text-sm font-medium animate-pulse">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            Someone is typing...
          </div>
        )}
        <div ref={messagesEndRef} />
`;
content = content.replace("<div ref={messagesEndRef} />", typingComponent);

// 3. Update textarea onChange to trigger typing status
// Find the textarea block
const oldTextarea = `onChange={(e) => setInputText(e.target.value)}`;
const newTextarea = `onChange={(e) => {\n                setInputText(e.target.value);\n                if (e.target.value.trim().length === 1 && inputText.length === 0) setTypingStatus(true);\n                if (e.target.value.trim().length === 0 && inputText.length > 0) setTypingStatus(false);\n              }}`;

content = content.replace(oldTextarea, newTextarea);

// 4. Reset typing status on send
const handleSendOld = `await sendMessage(text, undefined, undefined, replyId);`;
const handleSendNew = `await sendMessage(text, undefined, undefined, replyId);\n    setTypingStatus(false);`;
content = content.replace(handleSendOld, handleSendNew);

// 5. Online status for non-global threads
const oldPhoto = `{thread.isGlobal ? <Globe className="w-5 h-5" /> : thread.name?.[0]?.toUpperCase() || '#'}`;
const newPhoto = `{thread.isGlobal ? <Globe className="w-5 h-5" /> : thread.name?.[0]?.toUpperCase() || '#'}\n              </div>\n            )}\n            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#f8f9fa] dark:border-[#0a0a0a]" />`;

// Wait, the original code had:
//             {thread.photoURL ? (
//               <img src={thread.photoURL} className="w-10 h-10 rounded-full object-cover" />
//             ) : (
//               <div className={\`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold
//                 \${thread.isGlobal ? 'bg-blue-500' : thread.type === 'dm' ? 'bg-indigo-500' : 'bg-emerald-500'}\`}>
//                 {thread.isGlobal ? <Globe className="w-5 h-5" /> : thread.name?.[0]?.toUpperCase() || '#'}
//               </div>
//             )}

content = content.replace(
  "</div>\n            )}", 
  "</div>\n            )}\n            <div className=\"absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-[#0a0a0a]\" />"
);

fs.writeFileSync('src/components/community/ChatRoom.tsx', content);
