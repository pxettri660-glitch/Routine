const { JSDOM, VirtualConsole } = require('jsdom');
const virtualConsole = new VirtualConsole();
virtualConsole.on("error", (err) => console.error(err));
virtualConsole.on("jsdomError", (err) => console.error(err));
virtualConsole.on("log", (msg) => console.log(msg));

JSDOM.fromURL("http://localhost:3000/", {
  runScripts: "dangerously",
  resources: "usable",
  virtualConsole
}).then(dom => {
  setTimeout(() => {
    console.log("BODY HTML:", dom.window.document.body.innerHTML);
    process.exit(0);
  }, 5000);
}).catch(e => {
  console.error("FAILED TO LOAD:", e);
});
