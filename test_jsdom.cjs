const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs');

const virtualConsole = new VirtualConsole();
virtualConsole.on("error", (msg) => {
  console.log("JSDOM ERROR:", msg);
});
virtualConsole.on("log", (msg) => {
  console.log("JSDOM LOG:", msg);
});

JSDOM.fromURL("http://localhost:3000/", {
  runScripts: "dangerously",
  resources: "usable",
  virtualConsole
}).then(dom => {
  setTimeout(() => {
    console.log("Wait complete.");
    process.exit(0);
  }, 5000);
}).catch(e => {
  console.error("FAILED TO LOAD:", e);
});
