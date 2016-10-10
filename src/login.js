
import React from 'react';
import ReactDOM from 'react-dom';
import waitingWidget from './shared/waitingWidget';

let isShowLogin = false;

let showLogin = (onSuccessLogin) => {
	if(isShowLogin) return;
  let LoginComponent = require('./components/LoginSmall').default;
  let handleLogined = (username, password, autologin, cb) => {
  	waitingWidget.startWaiting();
  	setTimeout(unmountLogin, 1);
  	// setTimeout(() => {
  	onSuccessLogin && onSuccessLogin(username, password, autologin, cb);
  		
  	// }, 20);
  };
  ReactDOM.render(<LoginComponent onLogined={handleLogined}/>, window.document.getElementById('login-dom'));
  isShowLogin = true;
};

let unmountLogin = () => {
	ReactDOM.unmountComponentAtNode(window.document.getElementById('login-dom'));
	isShowLogin = false;
};

module.exports = {
	showLogin
};

