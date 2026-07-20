import fs from 'fs';
let content = fs.readFileSync('src/components/community/types.ts', 'utf-8');

content = content.replace("mutedMembers?: string[];", "mutedMembers?: string[];\n  typingUsers?: string[];");

fs.writeFileSync('src/components/community/types.ts', content);
