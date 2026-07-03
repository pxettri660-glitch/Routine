const fs = require('fs');
let code = fs.readFileSync('src/components/Jarvis.tsx', 'utf8');

// Replace everything between </AnimatePresence> and <button onClick={() => onNavigate && onNavigate('dashboard')} with just </AnimatePresence>\n </div>\n </div>\n <div className="flex items-center gap-2">
const regex = /<\/AnimatePresence>[\s\S]*?<div className="flex items-center gap-2">/m;
code = code.replace(regex, `</AnimatePresence>\n            </div>\n          </div>\n          <div className="flex items-center gap-2">`);

fs.writeFileSync('src/components/Jarvis.tsx', code);
