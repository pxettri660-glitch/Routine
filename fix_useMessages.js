import fs from 'fs';
let content = fs.readFileSync('src/components/community/hooks/useMessages.ts', 'utf-8');

const typingCode = `
  const setTypingStatus = async (isTyping: boolean) => {
    if (!thread || !user) return;
    try {
      const currentTyping = thread.typingUsers || [];
      const newTyping = isTyping 
        ? [...new Set([...currentTyping, user.uid])]
        : currentTyping.filter(uid => uid !== user.uid);
        
      await updateDoc(doc(db, 'threads', thread.id), {
        typingUsers: newTyping
      });
    } catch (e) {
      console.warn("Could not update typing status");
    }
  };
`;

content = content.replace("reactToMessage\n  };\n}", "reactToMessage,\n    setTypingStatus\n  };\n}");
content = content.replace("const reactToMessage = async", typingCode + "\n  const reactToMessage = async");

fs.writeFileSync('src/components/community/hooks/useMessages.ts', content);
