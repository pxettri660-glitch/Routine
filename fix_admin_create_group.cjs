const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

if (!code.includes('AdminCreateGroup')) {
  code = code.replace("import { UserProfile, Thread, Report } from './community/types';", 
    "import { UserProfile, Thread, Report } from './community/types';\nimport AdminCreateGroup from './community/AdminCreateGroup';");

  code = code.replace("const [loading, setLoading] = useState(true);",
    "const [loading, setLoading] = useState(true);\n  const [showCreateGroup, setShowCreateGroup] = useState(false);");

  code = code.replace("<button className=\"px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 transition-colors\">",
    "<button onClick={() => setShowCreateGroup(true)} className=\"px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 transition-colors\">");

  const modalUI = `
            {showCreateGroup && (
              <AdminCreateGroup 
                onClose={() => setShowCreateGroup(false)} 
                onSuccess={loadData} 
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}`;
  code = code.replace("</div>\n        )}\n      </div>\n    </div>\n  );\n}", modalUI);
  fs.writeFileSync('src/components/AdminPanel.tsx', code);
}
