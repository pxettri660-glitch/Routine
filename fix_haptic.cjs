const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /  const handleHapticNavigate = React\.useCallback\(\(view: string\) => \{\n    if \(window\.navigator && window\.navigator\.vibrate\) \{\n      window\.navigator\.vibrate\(50\);\n    \}\n    handleNavigate\(view\);\n  \}, \[\]\);\n\n  const handleNavigate = React\.useCallback\(\(view: string\) => \{\n    setCurrentView\(view\);\n    window\.location\.hash = view;\n  \}, \[\]\);/g;

const replacement = `  const handleNavigate = React.useCallback((view: string) => {
    setCurrentView(view);
    window.location.hash = view;
  }, []);

  const handleHapticNavigate = React.useCallback((view: string) => {
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }
    handleNavigate(view);
  }, [handleNavigate]);`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/App.tsx', code);
