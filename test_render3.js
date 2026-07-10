import React from 'react';
import { renderToString } from 'react-dom/server';

global.window = {
  location: { hash: '' },
  navigator: {},
  addEventListener: () => {},
  removeEventListener: () => {}
};
global.document = {
  documentElement: { classList: { add: () => {}, remove: () => {} } },
  getElementById: () => null
};

import App from './src/App.tsx';
try {
  const html = renderToString(React.createElement(App));
  console.log("RENDER HTML:", html);
} catch(e) {
  console.error(e);
}
