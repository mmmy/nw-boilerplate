import React, { PropTypes } from 'react';
// import Waves from './SearchWaitingWaves';
import classNames from 'classnames';
import localStorage from '../backend/localStorage';
// import store from '../store';
import nwApp from '../shared/nwApp';
import pkg from '../../package.json';

var udf = require('../backend/udf');

let { storageAccount, getAccount, removeAccount, saveUser, removeSavedUser, getAllSavedUsers } = localStorage;
				//email
function validateEmail(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}
//英文和中文
function validateName(name) {
	var re =  /^[a-zA-Z\u4e00-\u9fa5]+$/;
	return re.test(name);
}

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
		this.state = {
									errorText:'', 
									isLogining: false, 
									username: '', 
									password:'', 
									autoLogin: false, 
									usernameError: false, //弃用
									passwordError: false, //弃用
									renderType: 'login',  //'login','sign','reset'

									firstName: '',
									lastName: '',
									usernameNew: '',
									passwordNew: '',
									passwordNewConfirm: '',
									signError: '',
									signSucess: false,

									usernameReset: '',//忘记密码
									firstNameReset: '',
									lastNameReset: '',
									passwordReset: '',
									passwordResetConfirm: '',
									resetStep: 0, //0:验证email, 1:验证姓名, 2:更改密码, 3:开始进入
									resetError: '',
								};
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
		this.handleSignInputChange = (e) => {
			var keys = ['lastName','firstName','usernameNew','passwordNew','passwordNewConfirm'];
			var index = parseInt(e.target.id); //0:first name, 1:last name, 3:username, 4:password, 5:password confirm
			var key = keys[index];
			var value = e.target.value.trim();
			var state = {};
			state[key] = value;
			let signError = '';
			//validate
			if(key == 'firstName') {
				signError = (value.length < 12) && validateName(value) ? '' : '请输入正确的名字';
			}
			if(key == 'lastName') {
				signError = (value.length < 12) && validateName(value) ? '' : '请输入正确的姓氏';
			}
			if(key == 'usernameNew') {
				signError = validateEmail(value) ? '' : '请输入正确的电子邮箱';
			}
			if(key == 'passwordNew') {
				signError = (value.length >= 6 && value.length <= 20) ? '' : '6-20位数字、字母符号';
			}
			if(key == 'passwordNewConfirm') {
				signError = value == this.state.passwordNew ? '' : '两串密码不一致';
			}
			state.signError = signError;
			this.setState(state);
			$(e.target).toggleClass('error', signError != '');
		}
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
	//注册和找回密码使用
	enterApp(username, password) {
		try {
			window.heap.identify(username);
			window.USERNAME = username;
		} catch(e) {
			console.log(e);
		}
		this.hideLogin();

		setTimeout(function(){
			setAppStateAfterLogin();
		}, 10);
		var autoLogin = false;
		var { onLogined } = this.props;
		setTimeout(function(){
			autoLogin ? storageAccount(username, password) : removeAccount();
			window.document.body.style.opacity = '';
			onLogined && onLogined({username, password, autoLogin, loginState:{code:0}}, (error) => { 
				if(!error) {
					saveUser(username, password);
				}
			});
		}, 100);
	};

	handleSign() {
		var {firstName, lastName, usernameNew, passwordNew, passwordNewConfirm} = this.state;
		//validate
		if((firstName.length >= 12) || !validateName(firstName)) {
			this.setState({signError: '请输入正确的姓氏'});
			return;
		}
		if((lastName.length >= 12) || !validateName(lastName)) {
			this.setState({signError: '请输入正确的名字'});
			return;
		}
		if(!validateEmail(usernameNew)) {
			this.setState({signError: '请输入正确的电子邮箱'});
			return;
		}
		if(passwordNew.length < 6 || passwordNew.length > 20) {
			this.setState({signError: '密码为6-20位数字、字母符号'});
			return;
		}
		if(passwordNew !== passwordNewConfirm) {
			this.setState({signError: '两串密码不一致'});
			return;
		}
		if(!window.navigator.onLine) {
			this.setState({errorText: '未连接互联网 !'});
			return;
		}
		var that = this;

		var logInSuccess = () => {
			var newNode = $(`<div class="sign-success-container">
											<div><i class="icon-good"></i></div>
											<h4>解码历史, 洞悉未来</h4>
											<p>恭喜你注册成功!</p>
											<div class="ksty"><button>开始体验</button></div>
											<div><span class="time"><span class="value"></span>秒后自动进入拱石</span></div>
										</div>`);
			newNode.find('.ksty button').click(()=>{
				enterApp(usernameNew, passwordNew);
			});
			var count = 5;
			newNode.find('.time .value').text(count);
			var interval = setInterval(()=>{
				count --;
				if(count <= 0) {
					clearInterval(interval);
					this.enterApp(usernameNew, passwordNew);
				} else {
					newNode.find('.time .value').text(count);
				}
			},1000);
			$(that.refs.section_sign).append(newNode);
		};

		$(that.refs.sign_btn).html(`<i className='fa fa-spinner fa-spin'></i>`);

		var form = new window.FormData();
		form.append("name.first", firstName);
		form.append("name.last", lastName);
		form.append("password", passwordNew);
		form.append("email", usernameNew);
		form.append("website", "www.xx.com");
		form.append("fromType", "C");
		form.append('userType', 'Free Trial');
		form.append('expireAt', Date.now() + 60 * 24 * 3600 * 1000);

		udf.signIn(form, (repstate)=>{
			if(!repstate || (repstate.code != 0)) {
				$(that.refs.sign_btn).text('注册');
				var errorText = '注册失败,请联系拱石获取帮助';
				if(repstate) {
					if(repstate.code == 10004) errorText = '服务器内部错误';
					else if(repstate.code == 20001) errorText = '该用户已经被注册';
				}
				$(that.refs.sign_error).text(errorText);
				return;
			}
			//注册成功
			logInSuccess();
		});
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

	componentDidUpdate() {
		let { renderType,resetStep } = this.state;
		if(renderType == 'reset') {
			if($(this.refs.reset_inputs).children('input:visible:focus').length == 0) {
				$($(this.refs.reset_inputs).children('input:visible')[0]).focus();
			}
		}
	}

	componentWillUnmount(){
		// setAppStateAfterLogin();
		// window.removeEventListener('resize', this.handleRiseze);
	}

	render(){
		let { isLogining, username, password, autoLogin, renderType, firstName, lastName, usernameNew, passwordNew, passwordNewConfirm, signError } = this.state;
		let innerBtn = isLogining ? <i className='fa fa-spinner fa-spin'></i> : '登录';
		let autoLoginBtnClass = classNames('flat-btn autologin-button', {'checked':autoLogin});
		let autoLoginIconClass = classNames('icon-not-check', {'checked': autoLogin});
		let isEmpty = username === '' || password === '';

		let signBtnDisabled = signError || firstName === '' || lastName === '' || usernameNew==='' || passwordNew==='' || passwordNewConfirm==='' ;

		//忘记密码
		let { usernameReset, firstNameReset, lastNameReset, passwordReset, passwordResetConfirm, resetStep, resetError } = this.state;

		return (
      <div className='login-panelsmall-container' ref='login_panel_container' onMouseUp={ (e)=>{ e.stopPropagation() } }>
      	{/*<div className='fix-drag-bug'></div>*/}
      	<div ref='drag_panel' className='login-titlebar-container'  onMouseDown={this.fixDragableBug.bind(this)}>
      		<button style={{}} className='flat-btn button app-close' onClick={this.closeApp.bind(this)}></button>
      	</div>
      	<div className={'body-container ' + renderType}>
      		<div className='logo'></div>
      		<div className='error-text'>{this.state.errorText}</div>
      		<div className="section login">
      			<div className='user-name font-simsun' >{/*<span className='placeholder transition-all transition-ease' ref='holder_username'>用户名</span>*/}<input ref='input_user' onChange={this.changeUsernamne.bind(this)} type='text' value={username} placeholder='用户名'/>{this.state.usernameError ? <span className='error-icon'></span> : ''}</div>
      			<div className='password font-simsun' >{/*<span className='placeholder transition-all transition-ease' ref='holder_password'>密码</span>*/}<input ref='password_user' onChange={this.changePassword.bind(this)} onFocus={this.handleFocus.bind(this, 1)} onBlur={this.handleBlur.bind(this, 1)} type='password' value={password} placeholder='密码'/>{this.state.passwordError ? <span className='error-icon'></span> : ''}</div>
      			<div className='denglu'><button className='' onClick={this.handleLogin.bind(this)} disabled={isEmpty}>{innerBtn}</button></div>
      			<div className='options font-simsun'>
      				<button className={autoLoginBtnClass} onClick={this.toggleAutoLogin.bind(this)} >
      					<span className={autoLoginIconClass}></span>{/*<input onChange={this.changeAutoLogin.bind(this)} type='checkbox' checked={autoLogin}/>*/}
      					自动登录
      				</button>
      				<button className="flat-btn sign-btn" onClick={()=>{this.setState({renderType:'sign'})}}>注册账号</button>
      				<button className="flat-btn forget-btn" onClick={()=>{this.setState({renderType:'reset'})}}>忘记密码</button>
      			</div>
      		</div>
      		{/*---------------注册--------------*/}
					<div className="section sign" ref="section_sign">
						<div className="title">创建一个新的拱石账号</div>
						<div className="full-name"><input type="text" id='0' ref="sign_last_name" placeholder="姓" value={lastName} onChange={this.handleSignInputChange}/><input type="text" ref="sign_first_name" placeholder="名" id='1' value={firstName} onChange={this.handleSignInputChange}/></div>
						<div><input ref="sign_username" id='2' type="text" placeholder="邮箱" value={usernameNew} onChange={this.handleSignInputChange}/></div>
						<div><input ref="sign_password" id='3' type="password" placeholder="密码" value={passwordNew} onChange={this.handleSignInputChange}/></div>
						<div><input ref="sign_password_confirm" id='4' type="password" placeholder="确认密码" value={passwordNewConfirm} onChange={this.handleSignInputChange}/></div>
						<div className="fuwu">点击注册, 表示您同意我们的: <a>服务和隐私条款</a></div>
						<div className="zhuce"><button ref="sign_btn" disabled={signBtnDisabled} onClick={this.handleSign.bind(this)}>注册</button></div>
						<div className="error" ref="sign_error">{signError}</div>
						<div>
							<button className="flat-btn return" onClick={()=>{this.setState({renderType:'login'})}}><i className="fa fa-angle-left"></i></button>
						</div>
					</div>
      		{/*---------------忘记密码--------------*/}
					<div className={`section reset step-${resetStep}`}>
						<div className="title">
							{	function(){
									if(resetStep==1) { return <div>验证账号<span className="value">{usernameReset}</span>的信息</div>; }
									if(resetStep==2) { return '设置新密码' }
									return '找回密码'
								}()
							}
						</div>
						<div className={`inputs-wrapper step-${resetStep}`} ref="reset_inputs">
							<input value={usernameReset} onChange={(e)=>{ this.setState({usernameReset:e.target.value, resetError:''}) }} type="text" placeholder="输入注册电子邮箱" />
							<input value={lastNameReset} onChange={(e)=>{this.setState({lastNameReset:e.target.value})}} type="text" placeholder="输入注册时候的 姓" />
							<input value={firstNameReset} onChange={(e)=>{this.setState({firstNameReset:e.target.value}) }} type="text" placeholder="输入注册时候的 名" />
							<input value={passwordReset} onChange={(e)=>{this.setState({passwordReset:e.target.value})}} type="password" placeholder="设置新密码(6-20位数字、字母符号)" />
							<input value={passwordResetConfirm} onChange={(e)=>{this.setState({passwordResetConfirm:e.target.value})}} type="password" placeholder="确认密码" />
							<div className="good">
								<div><i className="icon-good"></i></div>
								<p>设置新密码成功</p>
								<p>请牢记您的新密码</p>
							</div>
							<div className="error" ref="reset_error">{resetError}</div>
						</div>
						<div className="yanzheng">
							<button ref="yanzheng_btn" onClick={this.handleValidateReset.bind(this)}>
								{
									function(){
										if(resetStep==0) return '下一步';
										if(resetStep==1) return '验证';
										if(resetStep==2) return '确定';
										return '进入拱石';
									}()
								}
							</button>
						</div>
						<div>
							<button className="flat-btn return" onClick={this.handleResetBack.bind(this)}><i className="fa fa-angle-left"></i></button>
						</div>
						<div><span className="time" ref="reset_interval"></span></div>
					</div>	
      	</div>
      	{/*<div className='wave-container'><Waves /></div>*/}
      </div>
    );
	}

	handleValidateReset(e) {
		if(!window.navigator.onLine) {
			this.setState({resetError: '未连接互联网 !'});
			return;
		}

		let { usernameReset, firstNameReset, lastNameReset, passwordReset, passwordResetConfirm, resetStep } = this.state;
		// this.setState({resetStep: resetStep+1});
		if(resetStep == 0) {    //验证username
			new Promise((resolve, reject)=>{
				udf.validateUser({username: usernameReset}, resolve, reject);
			}).then((result)=>{
				if(result) {
					if(result.code === 0) { this.setState({resetStep: resetStep+1, resetError:''}) }
					else if(result.code === 10001) { this.setState({resetError:'用户不存在'}) }
					else { this.setState({resetError:'服务器内部错误'}) }
				} else {
					this.setState({resetError:'未知错误,请稍后重试'});
				}
			}).catch((err)=>{
				console.error(err);
				this.setState({resetError:"验证失败,请稍后重试,或联系拱石"});
			});
		} else if(resetStep == 1) { //验证姓名
			new Promise((resolve, reject)=>{
				var postData = {};
				postData.username = usernameReset;
				postData['name.first'] = firstNameReset;
				postData['name.last'] = lastNameReset;
				udf.validateUser(postData,resolve,reject);
			}).then((result)=>{
				if(result) {
					if(result.code === 0) { this.setState({resetStep: resetStep+1, resetError:''}) }
					else if(result.code === 10001) { this.setState({resetError:'验证不正确'}) }
					else { this.setState({resetError:'服务器内部错误'}) }
				} else {
					this.setState({resetError:'未知错误,请稍后重试'});
				}
			}).catch((err)=>{
				console.error(err);
				this.setState({resetError:"验证失败,请稍后重试,或联系拱石"});
			});
		} else if(resetStep == 2) { //重设密码
			//判断密码是否正常
			if(passwordReset.length < 6 || passwordReset.length > 20 ) {
				this.setState({resetError:'密码为6-20位数字、字母符号'});
			} else if(passwordReset !== passwordResetConfirm) {
				this.setState({resetError:'密码不一致'});
			} else { //发送请求
				new Promise((resolve, reject)=>{
					var postData = {};
					postData.username = usernameReset;
					postData['name.first'] = firstNameReset;
					postData['name.last'] = lastNameReset;
					postData.passwordNew = passwordReset;
					udf.resetPassword(postData,resolve,reject);
				}).then((result)=>{
					if(result) {
						if(result.code === 0) { 
							//todo: start logi
							this.setState({resetStep: resetStep+1, resetError:''});
							var count = 5;
							$(this.refs.reset_interval).text(count+'秒后自动进入拱石');
							var interval = setInterval(()=>{
								count --;
								if(count === 0) {
									clearInterval(interval);
									this.enterApp(usernameReset, passwordReset);
								} else { $(this.refs.reset_interval).text(count+'秒后自动进入拱石'); }
							},1000);
						} else {
							this.setState({resetError:('重置密码失败'+result.code)});
						}
					} else {
						this.setState({resetError:'未知错误,请稍后重试'});
					}
				}).catch((err)=>{
					console.error(err);
					this.setState({resetError:"重置失败,请稍后重试,或联系拱石"});
				});
			}
		} else if(resetStep == 3) {
			this.enterApp(usernameReset, passwordReset);
		}

	}

	handleResetBack(e) {
		let { resetStep } = this.state;
		if(resetStep > 0) {
			this.setState({resetStep: resetStep - 1});
		} else {
			this.setState({renderType:'login'});
		}
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
