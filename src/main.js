import 'babel-polyfill';

import init from './shared/Init';
import actionsForIframe from './shared/actionsForIframe';
import app from './app';

let setChartLayout = () => {
  setTimeout(() => {
    let tv = document[window.document.getElementsByTagName('iframe')[0].id];
    if (!tv.Q5) {
      setChartLayout();
    } else {
      //const tv = window.document[window.document.getElementsByTagName('iframe')[0].id];
      tv.W76.setChartLayout(tv.Q5, '2v');
    }
  }, 6E3)
}

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
})
.then(() => {
  if(process.env.yq !== 'yes') { setChartLayout(); }
});
