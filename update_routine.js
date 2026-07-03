const fs = require('fs');

let code = fs.readFileSync('src/components/Routine.tsx', 'utf8');

// We will do some string replacements to add these fields to state and the UI.
// But it might be easier to just overwrite it entirely with a script since it requires significant changes.
