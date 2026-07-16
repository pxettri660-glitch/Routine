import fs from 'fs';
let content = fs.readFileSync('src/components/code-practice/MobileWorkspace.tsx', 'utf-8');

// replace the state for single file with multiple files
content = content.replace(
  "const [code, setCode] = useState(problem?.starterCode || '// Write your code here\\n');",
  `const [files, setFiles] = useState([{ id: '1', name: problem ? 'solution.ts' : 'main.ts', content: problem?.starterCode || '// Write your code here\\n', language: problem?.language || 'typescript' }]);
  const [activeFileId, setActiveFileId] = useState('1');
  const activeFile = files.find(f => f.id === activeFileId) || files[0];
  const [code, setCode] = useState(activeFile.content);
  
  useEffect(() => {
    setCode(activeFile.content);
  }, [activeFileId]);
  
  useEffect(() => {
    setFiles(prev => prev.map(f => f.id === activeFileId ? { ...f, content: code } : f));
  }, [code]);
  
  const [showFiles, setShowFiles] = useState(false);
  
  const createNewFile = () => {
    const newId = Date.now().toString();
    setFiles([...files, { id: newId, name: \`file\${files.length + 1}.ts\`, content: '', language: 'typescript' }]);
    setActiveFileId(newId);
    setShowFiles(false);
  };
  `
);

// Add Files button to top action bar
content = content.replace(
  '<span className="text-sm font-bold truncate max-w-[150px]">{problem?.title || \'main.ts\'}</span>',
  `<button onClick={() => setShowFiles(true)} className="text-sm font-bold truncate max-w-[150px] flex items-center gap-1 hover:text-indigo-500">
    {activeFile.name} <ChevronDown className="w-3 h-3" />
  </button>`
);

// Add file explorer sheet
const fileSheet = `
      {/* File Explorer Bottom Sheet */}
      <AnimatePresence>
        {showFiles && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFiles(false)}
              className="absolute inset-0 bg-black/50 z-[110]"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute bottom-0 left-0 right-0 z-[120] bg-white dark:bg-[#1a1a1a] rounded-t-3xl overflow-hidden max-h-[80vh] flex flex-col shadow-2xl border-t border-black/10 dark:border-white/10"
            >
              <div className="flex items-center justify-between p-4 border-b border-black/10 dark:border-white/10">
                <h3 className="font-bold text-lg">Files</h3>
                <div className="flex items-center gap-2">
                  <button onClick={createNewFile} className="p-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg"><Plus className="w-5 h-5" /></button>
                  <button onClick={() => setShowFiles(false)} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg"><X className="w-5 h-5" /></button>
                </div>
              </div>
              <div className="overflow-y-auto p-2">
                {files.map(f => (
                  <div key={f.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5">
                    <button 
                      onClick={() => { setActiveFileId(f.id); setShowFiles(false); }}
                      className={\`flex-1 flex items-center gap-3 p-2 text-left \${activeFileId === f.id ? 'text-indigo-600 dark:text-indigo-400 font-bold' : ''}\`}
                    >
                      <FileCode className="w-5 h-5" /> {f.name}
                    </button>
                    {files.length > 1 && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setFiles(files.filter(file => file.id !== f.id)); if (activeFileId === f.id) setActiveFileId(files.find(file => file.id !== f.id)!.id); }}
                        className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
`;

content = content.replace('{/* Smart Terminal Bottom Sheet */}', fileSheet + '\n      {/* Smart Terminal Bottom Sheet */}');

// make sure language is bound correctly
content = content.replace("language={problem?.language?.toLowerCase() || 'typescript'}", "language={activeFile.language || 'typescript'}");

fs.writeFileSync('src/components/code-practice/MobileWorkspace.tsx', content);
