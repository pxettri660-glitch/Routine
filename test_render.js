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
console.log(renderToString(React.createElement(App)));
