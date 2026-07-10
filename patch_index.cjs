const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const injection = `
    <script>
      window.onerror = function(message, source, lineno, colno, error) {
        fetch('/api/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'error', message, source, lineno, colno, stack: error ? error.stack : null })
        });
      };
      window.addEventListener('unhandledrejection', function(event) {
        fetch('/api/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'unhandledrejection', reason: event.reason ? event.reason.toString() : 'Unknown' })
        });
      });
      const originalConsoleError = console.error;
      console.error = function(...args) {
        fetch('/api/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'console.error', args: args.map(a => String(a)) })
        });
        originalConsoleError.apply(console, args);
      };
    </script>
`;

code = code.replace('<head>', '<head>' + injection);
fs.writeFileSync('index.html', code);

let serverCode = fs.readFileSync('server.ts', 'utf8');
const serverInjection = `
app.use(express.json());
app.post('/api/log', (req, res) => {
  console.log('CLIENT ERROR:', req.body);
  res.json({ ok: true });
});
`;
serverCode = serverCode.replace('// API routes go here FIRST', '// API routes go here FIRST' + serverInjection);
fs.writeFileSync('server.ts', serverCode);

