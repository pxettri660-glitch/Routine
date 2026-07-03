const fs = require('fs');
let code = fs.readFileSync('src/components/Jarvis.tsx', 'utf8');

code = code.replace(
  "          </button>\n          \n          <div className=\"flex items-center gap-2\">",
  "          \n          <div className=\"flex items-center gap-2\">\n            <button\n              onClick={() => onNavigate && onNavigate('dashboard')}\n              className={`p-2 rounded-full transition-colors flex items-center justify-center ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}\n              title=\"Close Assistant\"\n            >\n              <X className=\"w-5 h-5\" />\n            </button>"
);

code = code.replace(
  "          <button\n            onClick={() => onNavigate && onNavigate('dashboard')}\n            className={`p-2 rounded-full transition-colors flex items-center justify-center ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}\n            title=\"Close Assistant\"\n          >\n            <X className=\"w-5 h-5\" />\n          </button>\n          \n          <div",
  "          <div"
);

fs.writeFileSync('src/components/Jarvis.tsx', code);
