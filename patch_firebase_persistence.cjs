const fs = require('fs');
let code = fs.readFileSync('src/lib/firebase.ts', 'utf8');

code = code.replace(
  "// Removed offline persistence for iframe compatibility\nsetPersistence(auth, browserLocalPersistence).catch(console.error);",
  "// Enable offline persistence\nif (typeof window !== 'undefined') {\n  enableIndexedDbPersistence(db).catch((err) => {\n    if (err.code == 'failed-precondition') {\n      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a a time.');\n    } else if (err.code == 'unimplemented') {\n      console.warn('The current browser does not support all of the features required to enable persistence');\n    }\n  });\n}\n\nsetPersistence(auth, browserLocalPersistence).catch(console.error);"
);

fs.writeFileSync('src/lib/firebase.ts', code);
