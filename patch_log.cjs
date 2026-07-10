const fs = require('fs');
let serverCode = fs.readFileSync('server.ts', 'utf8');

serverCode = serverCode.replace(
  "console.log('CLIENT ERROR:', req.body);",
  "fs.appendFileSync('client_errors.log', JSON.stringify(req.body) + '\\n');"
);
serverCode = "import fs from 'fs';\n" + serverCode;

fs.writeFileSync('server.ts', serverCode);
