import fs from 'fs';
let content = fs.readFileSync('src/components/community/ChatSidebar.tsx', 'utf-8');

const photoBlock = `
                    {thread.photoURL ? (
                      <img src={thread.photoURL} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className={\`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white
                        \${thread.isGlobal ? 'bg-blue-500' : thread.type === 'dm' ? 'bg-indigo-500' : 'bg-emerald-500'}\`}>
                        {thread.isGlobal ? <Globe className="w-6 h-6" /> : name[0]?.toUpperCase() || '#'}
                      </div>
                    )}
`;

const newPhotoBlock = `
                    {thread.photoURL ? (
                      <img src={thread.photoURL} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className={\`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white
                        \${thread.isGlobal ? 'bg-blue-500' : thread.type === 'dm' ? 'bg-indigo-500' : 'bg-emerald-500'}\`}>
                        {thread.isGlobal ? <Globe className="w-6 h-6" /> : name[0]?.toUpperCase() || '#'}
                      </div>
                    )}
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#f8f9fa] dark:border-[#111111]" />
`;

content = content.replace(photoBlock.trim(), newPhotoBlock.trim());
fs.writeFileSync('src/components/community/ChatSidebar.tsx', content);
