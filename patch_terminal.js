import fs from 'fs';
let content = fs.readFileSync('src/components/code-practice/MobileWorkspace.tsx', 'utf-8');

const dragCode = `
            {/* Drag Handle / Header */}
            <div 
              className="flex items-center justify-between px-4 py-2 border-b border-[#3c3c3c] bg-[#252526] touch-none cursor-ns-resize"
              onPointerDown={(e) => {
                e.preventDefault();
                const startY = e.clientY;
                const startHeight = terminalHeight;
                const onPointerMove = (moveEvent) => {
                  const delta = startY - moveEvent.clientY;
                  const newHeight = Math.max(100, Math.min(window.innerHeight * 0.9, startHeight + delta));
                  setTerminalHeight(newHeight);
                };
                const onPointerUp = () => {
                  document.removeEventListener('pointermove', onPointerMove);
                  document.removeEventListener('pointerup', onPointerUp);
                };
                document.addEventListener('pointermove', onPointerMove);
                document.addEventListener('pointerup', onPointerUp);
              }}
            >
`;

content = content.replace('{/* Drag Handle / Header */}\n            <div className="flex items-center justify-between px-4 py-2 border-b border-[#3c3c3c] bg-[#252526] touch-none">', dragCode);

// add word wrap config to monaco 
content = content.replace("wordWrap: 'on',", "wordWrap: 'on',\n                wrappingIndent: 'indent',");

fs.writeFileSync('src/components/code-practice/MobileWorkspace.tsx', content);
