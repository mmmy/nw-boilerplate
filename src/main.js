// import 'babel-polyfill';

import init from './shared/Init';
import login from './login';
import waitingWidget from './shared/waitingWidget';
// import app from './app';
// import store from './store';
let { initJquery, initAfterLogin } = init;

let showLogin = login.showLogin;

let loginSuccess = (username, password, autologin, cb) => {
  let actionsForIframe = require('./shared/actionsForIframe'),
      store = require('./store'),
      actions = require('./flux/actions'),
      app = require('./app');
  initAfterLogin();
  actionsForIframe(store);
  store.dispatch(actions.accountActions.setUser(username, password, autologin));
  app();
  cb && cb();
  // setTimeout(waitingWidget.removeWaiting,2000);
};

Promise.all([
  new Promise((resolve) => {
    if(window.addEventListener) {
      window.addEventListener('DOMContentLoaded', resolve);
    } else {
      window.attachEvent('onLoad', resolve);
    }
  })
]).then(() => {

  initJquery();
  require('./update/ksUpdate');
  showLogin(loginSuccess);
  // initAfterLogin();

  // actionsForIframe(store);

  if (process.env.NODE_ENV === 'development') {
    let head = document.getElementsByTagName('head')[0];
    let script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'http://localhost:35729/livereload.js';
    head.appendChild(script);
  }
  // loginSuccess();
  // app();
});
