import fs from 'fs';
let content = fs.readFileSync('src/components/CodePractice.tsx', 'utf-8');
content = content.replace(
  "{view === 'workspace' && (\n            <Workspace \n              problem={selectedProblem} \n              onAwardXP={onAwardXP} \n              onClose={() => setView(selectedProblem ? 'problems' : 'dashboard')} \n            />\n          )}",
  ""
);
content = content.replace("view === 'workspace' && selectedProblem", "selectedProblem");
content = content.replace("view === 'workspace' ? 'pb-4' : 'pb-32'", "'pb-32'");
fs.writeFileSync('src/components/CodePractice.tsx', content);
