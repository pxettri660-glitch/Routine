const fs = require('fs');
let code = fs.readFileSync('src/components/community/ChatMessageBubble.tsx', 'utf8');

code = code.replace("const iReacted = user && users.includes(user.uid);", 
  "const usersList = users as string[];\n              const iReacted = user && usersList.includes(user.uid);");

code = code.replace("<span>{emoji}</span>\n                  <span className=\"opacity-80\">{users.length}</span>",
  "<span>{emoji}</span>\n                  <span className=\"opacity-80\">{usersList.length}</span>");

fs.writeFileSync('src/components/community/ChatMessageBubble.tsx', code);
