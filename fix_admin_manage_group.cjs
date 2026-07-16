const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

if (!code.includes('AdminManageGroup')) {
  code = code.replace("import AdminCreateGroup from './community/AdminCreateGroup';", 
    "import AdminCreateGroup from './community/AdminCreateGroup';\nimport AdminManageGroup from './community/AdminManageGroup';");

  code = code.replace("const [showCreateGroup, setShowCreateGroup] = useState(false);",
    "const [showCreateGroup, setShowCreateGroup] = useState(false);\n  const [managingGroup, setManagingGroup] = useState<Thread | null>(null);");

  code = code.replace("<button className=\"p-2 text-black/40 hover:text-black dark:text-white/40 dark:hover:text-white bg-black/5 dark:bg-white/5 rounded-lg\">",
    "<button onClick={() => setManagingGroup(g)} className=\"p-2 text-black/40 hover:text-black dark:text-white/40 dark:hover:text-white bg-black/5 dark:bg-white/5 rounded-lg\">");

  const modalUI = `
            {showCreateGroup && (
              <AdminCreateGroup 
                onClose={() => setShowCreateGroup(false)} 
                onSuccess={loadData} 
              />
            )}
            {managingGroup && (
              <AdminManageGroup
                group={managingGroup}
                onClose={() => setManagingGroup(null)}
                onSuccess={loadData}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}`;
  code = code.replace("            {showCreateGroup && (\n              <AdminCreateGroup \n                onClose={() => setShowCreateGroup(false)} \n                onSuccess={loadData} \n              />\n            )}\n          </div>\n        )}\n      </div>\n    </div>\n  );\n}", modalUI);
  fs.writeFileSync('src/components/AdminPanel.tsx', code);
}
