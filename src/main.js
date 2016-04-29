import 'babel-polyfill';

import init from './shared/Init';
import actionsForIframe from './shared/actionsForIframe';
import app from './app';

Promise.all([
  new Promise((resolve) => {
    if(window.addEventListener) {
      window.addEventListener('DOMContentLoaded', resolve);
    } else {
      window.attachEvent('onLoad', resolve);
    }
  })
]).then(() => {

  init();

  actionsForIframe(store);

  if (process.env.NODE_ENV === 'development') {
    let head = document.getElementsByTagName('head')[0];
    let script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'http://localhost:35729/livereload.js';
    head.appendChild(script);
  }
  app();
});
