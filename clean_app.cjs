const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// I will fix the duplicates by just replacing the regex globally to a single instance.
// For isNavVisible:
code = code.replace(/  const \[isNavVisible, setIsNavVisible\] = useState\(true\);\n  const lastScrollY = useRef\(0\);\n\n  useEffect\(\(\) => \{\n    const handleScroll = \(e\) => \{\n      const target = e.target;\n      if \(\!target \|\| \!target.scrollTop\) return;\n      const currentScrollY = target.scrollTop;\n      if \(currentScrollY > lastScrollY.current && currentScrollY > 50\) \{\n        setIsNavVisible\(false\);\n      \} else \{\n        setIsNavVisible\(true\);\n      \}\n      lastScrollY.current = currentScrollY;\n    \};\n    const mainContainer = document.getElementById\('main-scroll-container'\);\n    if \(mainContainer\) \{\n      mainContainer.addEventListener\('scroll', handleScroll, \{ passive: true \}\);\n      return \(\) => mainContainer.removeEventListener\('scroll', handleScroll\);\n    \}\n  \}, \[\]\);\n/g, "");

// Add it back exactly once
const stateAnchor = `  const [currentView, setCurrentView] = useState<string>(() => {
    const hash = window.location.hash.replace('#', '');
    return hash || 'dashboard';
  });`;

const stateReplace = `  const [currentView, setCurrentView] = useState<string>(() => {
    const hash = window.location.hash.replace('#', '');
    return hash || 'dashboard';
  });
  const [isNavVisible, setIsNavVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = (e: any) => {
      const target = e.target;
      if (!target || !target.scrollTop) return;
      const currentScrollY = target.scrollTop;
      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        setIsNavVisible(false);
      } else {
        setIsNavVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };
    const mainContainer = document.getElementById('main-scroll-container');
    if (mainContainer) {
      mainContainer.addEventListener('scroll', handleScroll, { passive: true });
      return () => mainContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);`;

code = code.replace(stateAnchor, stateReplace);

// Now do the same for handleHapticNavigate
code = code.replace(/  const handleHapticNavigate = React.useCallback\(\(view: string\) => \{\n    if \(window.navigator && window.navigator.vibrate\) \{\n      window.navigator.vibrate\(50\);\n    \}\n    handleNavigate\(view\);\n  \}, \[\]\);\n\n/g, "");

const funcAnchor = `  const handleNavigate = React.useCallback((view: string) => {`;
const funcReplace = `  const handleHapticNavigate = React.useCallback((view: string) => {
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }
    handleNavigate(view);
  }, []);

  const handleNavigate = React.useCallback((view: string) => {`;

code = code.replace(funcAnchor, funcReplace);

fs.writeFileSync('src/App.tsx', code);
