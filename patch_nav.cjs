const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Remove the blocking email verification overlay and replace with a banner inside the main app
code = code.replace(
  /{!showSplash && !authLoading && user && !user\.emailVerified && \([\s\S]*?<\/[dD]iv>\s*?<\/[dD]iv>\s*?\)}/,
  ""
);

// 2. Wrap main app in user check, and insert the banner at the top of the main app
code = code.replace(
  /<div className=\{\`min-h-\[100dvh\] flex flex-col transition-all duration-300 \$\{getJarvisThemeClass\(\)\} bg-transparent\`\}>/,
  `{!showSplash && !authLoading && user && (
      <div className={\`min-h-[100dvh] flex flex-col transition-all duration-300 \${getJarvisThemeClass()} bg-transparent\`}>
        {!user.emailVerified && (
          <div className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-2 z-50 relative">
            <Mail className="w-4 h-4" />
            Please verify your email address ({user.email}). 
            <button onClick={() => window.location.reload()} className="underline font-bold ml-2">Refresh</button>
          </div>
        )}`
);

// 3. Close the main app wrapper at the end of the return statement
code = code.replace(
  /        <\/div>\n      \)}\n    <\/div>\n    <\/>\n  \);\n}/,
  `        </div>\n      )}\n    </div>\n    )}\n    </>\n  );\n}`
);

// 4. Fix the bottom navigation bar CSS
code = code.replace(
  /<div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">/,
  `<div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-2 sm:px-4 pointer-events-none w-full">`
);

code = code.replace(
  /<div className="pointer-events-auto flex items-center justify-between gap-1 sm:gap-2 px-3 py-2 rounded-\[2rem\] shadow-2xl backdrop-blur-2xl border bg-white\/70 dark:bg-\[\#18181b\]\/80 border-black\/5 dark:border-white\/10 shadow-black\/5 dark:shadow-black\/50 transition-colors duration-300 w-full max-w-fit overflow-x-auto \[\&::-webkit-scrollbar\]:hidden \[-ms-overflow-style:none\] \[scrollbar-width:none\]">/,
  `<div className="pointer-events-auto flex items-center justify-start sm:justify-center gap-1 sm:gap-2 px-3 py-2 rounded-[2rem] shadow-2xl backdrop-blur-2xl border bg-white/70 dark:bg-[#18181b]/80 border-black/5 dark:border-white/10 shadow-black/5 dark:shadow-black/50 transition-colors duration-300 max-w-full overflow-x-auto no-scrollbar">`
);

fs.writeFileSync('src/App.tsx', code);
