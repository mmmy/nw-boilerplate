// import 'babel-polyfill';

import init from './shared/Init';
import login from './login';
import waitingWidget from './shared/waitingWidget';
// import app from './app';
// import store from './store';
let { initJquery, initAfterLogin } = init;

let showLogin = login.showLogin;

let loginSuccess = (info, cb) => {
  let actionsForIframe = require('./shared/actionsForIframe'),
      store = require('./store'),
      actions = require('./flux/actions'),
      app = require('./app');
  initAfterLogin();
  actionsForIframe(store);
  store.dispatch(actions.accountActions.setUser(info));
  var onClose = (isExpired) => {
    if(!isExpired) {
      //显示更新日志, 移动到guide之后显示
      // require('./ksControllers/updateLog').check();
    }
  };
  //检查用户过期信息
  if(require('./ksControllers/trialReminder').check(info, onClose)) {
    //没有过期
    app();
  }
  cb && cb();
  // setTimeout(waitingWidget.removeWaiting,2000);
};
// async function sleep(timeout) {  
//   return new Promise((resolve, reject) => {
//     setTimeout(function() {
//       resolve();
//     }, timeout);
//   });
// }
// (async function() {
//   console.log('Do some thing, ' + new Date());
//   await sleep(3000);
//   console.log('Do other things, ' + new Date());
// })();

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
  console.log(process.platform);
  if (process.platform == 'darwin')
    require('./update/ksUpdateMac');
  if (process.platform == 'win' || process.platform == 'win32' || process.platform == 'win64')
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
