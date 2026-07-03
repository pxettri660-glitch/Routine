const fs = require('fs');
let code = fs.readFileSync('src/components/Jarvis.tsx', 'utf8');

const regex = /<button\s*onClick={\(\) => onNavigate && onNavigate\('dashboard'\)}\s*className={`p-2 rounded-full transition-colors flex items-center justify-center \${isDark \? 'hover:bg-white\/10' : 'hover:bg-black\/5'}`}\s*title="Close Assistant"\s*>\s*<X className="w-5 h-5" \/>\s*<div className="flex items-center gap-2">/gm;

code = code.replace(regex, `<div className="flex items-center gap-2">`);

fs.writeFileSync('src/components/Jarvis.tsx', code);
