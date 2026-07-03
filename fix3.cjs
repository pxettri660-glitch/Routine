const fs = require('fs');
let code = fs.readFileSync('src/components/Jarvis.tsx', 'utf8');

code = code.replace(
  "  isThemeLight = false,\n  onToggleLightDarkTheme\n}: JarvisProps) {",
  "  isThemeLight = false,\n  onToggleLightDarkTheme,\n  onNavigate\n}: JarvisProps) {"
);

fs.writeFileSync('src/components/Jarvis.tsx', code);
