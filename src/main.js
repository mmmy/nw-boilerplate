import 'babel-polyfill';

import init from './shared/Init';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';


import Root from './containers/Root';
import GenerateStore from './flux/GenerateStore';

let store = GenerateStore();
window.store = store;

let setChartLayout = () => {
  setTimeout(() => {
    var tv = document[window.document.getElementsByTagName('iframe')[0].id];
    if (tv.Q5)
      tv.W76.setChartLayout(tv.Q5, '2v');
    else
      getTV();
  }, 3.5E3)
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

  if (process.env.NODE_ENV === 'development') {
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'http://localhost:35729/livereload.js';
    head.appendChild(script);
  }
  ReactDOM.render(<Provider store={store}><Root /></Provider>, document.getElementById('app'));

  if (process.env.NODE_ENV === 'development') require('nw.gui').Window.get().showDevTools();

})
.then(() => {
  setChartLayout();
});
