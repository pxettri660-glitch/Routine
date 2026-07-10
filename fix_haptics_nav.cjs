const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

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
    const handleScroll = (e) => {
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

const funcAnchor = `  const handleNavigate = React.useCallback((view: string) => {`;
const funcReplace = `  const handleHapticNavigate = React.useCallback((view: string) => {
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }
    handleNavigate(view);
  }, []);

  const handleNavigate = React.useCallback((view: string) => {`;

code = code.replace(funcAnchor, funcReplace);

// also we need to set the id="main-scroll-container" to the main element
const mainAnchor = "<main className={`flex-1 flex flex-col min-w-0 relative z-10 ${currentView !== 'jarvis' ? 'h-[100dvh] overflow-y-auto overflow-x-hidden' : ''}`}>\n";
const mainReplace = "<main id=\"main-scroll-container\" className={`flex-1 flex flex-col min-w-0 relative z-10 ${currentView !== 'jarvis' ? 'h-[100dvh] overflow-y-auto overflow-x-hidden' : ''}`}>\n";

code = code.replace(mainAnchor, mainReplace);

fs.writeFileSync('src/App.tsx', code);
