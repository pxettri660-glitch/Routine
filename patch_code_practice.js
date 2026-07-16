import fs from 'fs';
let content = fs.readFileSync('src/components/CodePractice.tsx', 'utf-8');
content = content.replace("import Workspace from './code-practice/Workspace';", "import MobileWorkspace from './code-practice/MobileWorkspace';");
content = content.replace(/\{view === 'workspace' && \([\s\S]*?Workspace[\s\S]*?onClose=\{\(\) => setView\(selectedProblem \? 'problems' : 'dashboard'\)\} \/>\s*\)\}/, '');
content = content.replace("return (", `if (view === 'workspace') {
    return (
      <MobileWorkspace 
        problem={selectedProblem} 
        onAwardXP={onAwardXP} 
        onClose={() => setView(selectedProblem ? 'problems' : 'dashboard')} 
      />
    );
  }

  return (`);
fs.writeFileSync('src/components/CodePractice.tsx', content);
