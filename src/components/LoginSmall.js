import React, { PropTypes } from 'react';
// import Waves from './SearchWaitingWaves';
import classNames from 'classnames';
import localStorage from '../backend/localStorage';
// import store from '../store';
import nwApp from '../shared/nwApp';
import pkg from '../../package.json';
let { storageAccount, getAccount, removeAccount, saveUser, removeSavedUser, getAllSavedUsers } = localStorage;

let setAppStateBeforeLogin = () => {
	// $('.app-drag-area').css('-webkit-app-region','');
	let width = pkg.window.width || 400;
	let height = pkg.window.height || 470;
	nwApp.appSetMinimumSize(width, height);
	nwApp.appSetMaximumSize(width, height);
	nwApp.appSetSize(width, height);
	// nwApp.appSetResizable(false);
};

let setAppStateAfterLogin = () => {
	// $('.app-drag-area').css('-webkit-app-region','drag');
	// nwApp.appSetSize(900, 600);
	nwApp.appSetMinimumSize(1200, 700);
	nwApp.appSetMaximumSize(3000, 2000);
	nwApp.appSetSize(1350, 800);
	// nwApp.appSetResizable(true);
	nwApp.appSetCenter();
};

const propTypes = {
	onLogined: PropTypes.func,
};

const defaultProps = {

};

class Login extends React.Component {

	constructor(props) {
		super(props);
		this.state = {errorText:'', isLogining: false, username: '', password:'', autoLogin: false, usernameError: false, passwordError: false};
		let that = this;
		// this.handleRiseze = (e) => {
		// 	if(store.getState().account.username) return;
		// 	let height = $(that.refs.login_panel_container).height();
		// 	let waveNode = that._waveNode || $('.waves-container');
		// 	let logoNode = that._logoNode || $('.btn-container');
		// 	let waveTop =  - ((height - 232.75) - 450 - 30);
		// 	let logoTop =  - ((height - 232.75) - 100);
		// 	waveNode.css({top: waveTop, transitionProperty: (e ? 'none' : '')});
		// 	logoNode.css({top: logoTop, transitionProperty: (e ? 'none' : '')});
		// }
	}

	initUI() {
		let waveNode = $('.waves-container');
		let logoNode = $('.btn-container');
		logoNode.css({
			'background-position-x': '50%',
			// 'height': '80px',
			'background-size': '80px',
			'color': 'transparent',
			'paddingTop': '40px',
			'paddingBottom': '40px',
		});
		this._waveNode = waveNode;
		this._logoNode = logoNode;
		$('.container-stockview').css('opacity', 0);
	}

	resetUI() {
		let waveNode = this._waveNode || $('.waves-container');
		let logoNode = this._logoNode || $('.btn-container');
		waveNode.removeAttr('style');
		logoNode.removeAttr('style');
	}

	autoLogin() {
		let {username, password} = getAccount();
		if (username) {
			this.moveLeft(0, true);
			this.moveLeft(1, true);
			this.setState({username, password, autoLogin: true});
			let that = this;
			setTimeout(function(){
				that.handleLogin.call(that);	
			}, 3000);
		}
	}

	componentDidMount() {
		// this.initUI();
		// this.handleRiseze();
		// window.addEventListener('resize', this.handleRiseze);
		setAppStateBeforeLogin();

		let autoLogin = this.autoLogin.bind(this);
		// $(this.refs.login_panel_container).one('webkitAnimationEnd animationed', () => {
			autoLogin();
		// });
		$(this.refs.drag_panel).on('mousedown', function(e){
			console.log(e);
		});
		$(this.refs.input_user).on('focus', this.handleUsernameFocus.bind(this));
		$(this.refs.input_user).on('blur', this.handleUsernameBlur.bind(this));
	}

	componentWillReceiveProps(){

	}

	shouldComponentUpdate(){
		return true;
	}

	componentWillUnmount(){
		// setAppStateAfterLogin();
		// window.removeEventListener('resize', this.handleRiseze);
	}

	render(){
		let { isLogining, username, password, autoLogin } = this.state;
		let innerBtn = isLogining ? <i className='fa fa-spinner fa-spin'></i> : '登录';
		let autoLoginBtnClass = classNames('flat-btn autologin-button', {'checked':autoLogin});
		let autoLoginIconClass = classNames('icon-not-check', {'checked': autoLogin});
		let isEmpty = username === '' || password === '';

		return (
      <div className='login-panelsmall-container' ref='login_panel_container' onMouseUp={ (e)=>{ e.stopPropagation() } }>
      	{/*<div className='fix-drag-bug'></div>*/}
      	<div ref='drag_panel' className='login-titlebar-container'  onMouseDown={this.fixDragableBug.bind(this)}>
      		<button style={{}} className='flat-btn button app-close' onClick={this.closeApp.bind(this)}></button>
      	</div>
      	<div className='body-container'>
      		<div className='logo'></div>
      		<div className='error-text'>{this.state.errorText}</div>
      		<div>
      			<div className='user-name font-simsun' >{/*<span className='placeholder transition-all transition-ease' ref='holder_username'>用户名</span>*/}<input ref='input_user' onChange={this.changeUsernamne.bind(this)} type='text' value={username} placeholder='用户名'/>{this.state.usernameError ? <span className='error-icon'></span> : ''}</div>
      			<div className='password font-simsun' >{/*<span className='placeholder transition-all transition-ease' ref='holder_password'>密码</span>*/}<input ref='password_user' onChange={this.changePassword.bind(this)} onFocus={this.handleFocus.bind(this, 1)} onBlur={this.handleBlur.bind(this, 1)} type='password' value={password} placeholder='密码'/>{this.state.passwordError ? <span className='error-icon'></span> : ''}</div>
      			<div className='denglu'><button className='' onClick={this.handleLogin.bind(this)} disabled={isEmpty}>{innerBtn}</button></div>
      			<div className='options font-simsun'>
      				<button className={autoLoginBtnClass} onClick={this.toggleAutoLogin.bind(this)} >
      					<span className={autoLoginIconClass}></span>{/*<input onChange={this.changeAutoLogin.bind(this)} type='checkbox' checked={autoLogin}/>*/}
      					自动登录
      				</button>
      			</div>
      		</div>
      	</div>
      	{/*<div className='wave-container'><Waves /></div>*/}
      </div>
    );
	}

	fixDragableBug(e) {
		nwApp.updateAppDragable();
		console.log(e)
	}

	closeApp(e) {
		nwApp.appClose();
	}

	moveLeft(index=0, left=false) { //0:用户名, 1:密码
		if(index === 0) {
			let node = $(this.refs.holder_username);
			let width = node.width();
			left ? node.css('left', -width-10) : node.css('left', '0');
		} else if(index === 1) {
			let node = $(this.refs.holder_password);
			let width = node.width();
			left ? node.css('left', -width-10) : node.css('left', '0');
		}
	}

	handleFocus(index, e) {
		this.moveLeft(index, true);
	}

	handleBlur(index, e) {
		if(!e.target.value) {
			this.moveLeft(index, false);
		}
	}

	handleUsernameFocus(e) {
		console.log(e);
		let that = this;
		let userItemClickHandler = (e) => {
			let data = $(e.target).data('data');
			let username = data.U;
			let password = data.P;
			that.setState({username, password});
			that.refs.input_user.blur();
		};
		let deleteUser = (e) => {
			e.stopPropagation();
			let $parent = $(e.target).closest('.user-name-item');
			let data = $parent.data('data');
			let username = data.U;
			removeSavedUser(username);
			$parent.remove();
		};
		let $target = $(e.target);
		let users = getAllSavedUsers();

		if(users.length==0) {
			return;
		}

		let userNodes = users.map((ele) => {
			let deleteBtn = $('<button>').addClass('flat-btn delete-user').click(deleteUser);
			let node = $('<li>').addClass('user-name-item').text(ele.U).data('data',ele).click(userItemClickHandler).append(deleteBtn);
			return node;
		});
		console.log(userNodes)
		let popUp = $('<div>').addClass('username-list-container').append(userNodes).mousedown(function(event) {
			/* Act on the event */
			event.preventDefault();
			event.stopPropagation();
		});;
		$target.after(popUp);
	}

	handleUsernameBlur(e) {
		console.log(e);
		$(e.target).siblings('.username-list-container').remove();
	}

	handleLogin() {
		if(!window.navigator.onLine) {
			this.setState({errorText: '未连接互联网 !'});
			return;
		}
		this.setState({errorText: '', isLogining: true, usernameError: false, passwordError: false});
		let { onLogined } = this.props;
		let that = this;
		let username = this.state.username;
		let password = this.state.password;
		let autoLogin = this.state.autoLogin;

		var udf = require('../backend/udf');

		//udf.getLoginInfo({username: username,password:password}, function(data) {if(data)loginstate=data;});
		var postData = 'username='+ encodeURIComponent(username)+'&password='+encodeURIComponent(password);
		udf.getLoginInfo(postData, function(data) {
			var loginstate = data;
			if (!loginstate || (loginstate.code != 0 && loginstate.code != 10003/*用户过期*/)) {
				//console.log('login fail');
				var errorText = '登录错误,请联系拱石获取帮助';
				if(loginstate) {
					if(loginstate.code == 10001) errorText = '用户名不存在!';
					else if(loginstate.code == 10002) errorText = '密码不正确!';
					else if(loginstate.code == 10004) errorText = '服务器内部错误!';
				}
				that.setState({isLogining: false, passwordError:false, errorText:errorText});
				return; 
			} // else console.log("login success");
			try {
				window.heap.identify(username);
				window.USERNAME = username;
			} catch(e) {
				console.log(e);
			}
			//login success, into the stockingview
			// setTimeout(() => {
			that.hideLogin();

			setTimeout(function(){
				setAppStateAfterLogin();
			}, 10);
			
			setTimeout(function(){
				autoLogin ? storageAccount(username, password) : removeAccount();
				window.document.body.style.opacity = '';
				onLogined && onLogined({username, password, autoLogin, loginState:loginstate}, (error) => { 
					if(!error) {
						saveUser(username, password);
					}
				});
			}, 2000);
			// }, 0);
		});
	}

	hideLogin() {
		this.refs.login_panel_container.style.display = 'none';
		window.document.body.style.opacity = '0';
	}

	startClose() { //动画结束后 移除dom
		let {close} = this.props;
		// this.resetUI();
		$(this.refs.login_panel_container).removeClass('slideInUp').addClass('zoomOut').one('webkitAnimationEnd animationed', () => {
			close && close();
			$('.container-stockview').css('opacity', '');
		});
	}

	changeUsernamne(e) {
		this.setState({username: e.target.value});
	}
	changePassword(e) {
		this.setState({password: e.target.value});
	}
	changeAutoLogin(e) {
		this.setState({autoLogin: e.target.checked});
	}
	toggleAutoLogin() {
		this.setState({autoLogin: !this.state.autoLogin});
	}
}

Login.propTypes = propTypes;
Login.defaultProps = defaultProps;

export default Login;
