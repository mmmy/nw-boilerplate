import React, { PropTypes } from 'react';
import Waves from './SearchWaitingWaves';
import classNames from 'classnames';
import { storageAccount, getAccount, removeAccount } from '../backend/localStorage';

const propTypes = {
	onLogined: PropTypes.func,
};

const defaultProps = {

};

class Login extends React.Component {

	constructor(props) {
		super(props);
		this.state = {isLogining: false, username: '', password:'', autoLogin: false};
		let that = this;
		this.handleRiseze = (e) => {
			let height = $(that.refs.login_panel_container).height();
			let waveNode = that._waveNode || $('.waves-container');
			let logoNode = that._logoNode || $('.btn-container');
			let waveTop =  - ((height - 232.75) - 450 - 30);
			let logoTop =  - ((height - 232.75) - 100);
			waveNode.css({top: waveTop, transitionProperty: (e ? 'none' : '')});
			logoNode.css({top: logoTop, transitionProperty: (e ? 'none' : '')});
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
			this.handleLogin();
		}
	}

	componentDidMount() {
		this.initUI();
		this.handleRiseze();
		window.addEventListener('resize', this.handleRiseze);
		let autoLogin = this.autoLogin.bind(this);
		$(this.refs.login_panel_container).one('webkitAnimationEnd animationed', () => {
			autoLogin();
		});
	}

	componentWillReceiveProps(){

	}

	shouldComponentUpdate(){
		return true;
	}

	componentWillUnmount(){
		window.removeEventListener('resize', this.handleRiseze);
	}

	render(){
		let { isLogining, username, password, autoLogin } = this.state;
		let innerBtn = isLogining ? <i className='fa fa-spinner fa-spin'></i> : '登录';
		return (
      <div className='login-panel-container animated slideInUp' ref='login_panel_container'>
      	<div className='body-container'>
      		<div className='logo'></div>
      		<div>
      			<div className='user-name' ><span className='placeholder transition-all transition-ease' ref='holder_username'>用户名</span><input onChange={this.changeUsernamne.bind(this)} onFocus={this.handleFocus.bind(this, 0)} onBlur={this.handleBlur.bind(this, 0)} type='text' value={username}/></div>
      			<div className='password' ><span className='placeholder transition-all transition-ease' ref='holder_password'>密码</span><input onChange={this.changePassword.bind(this)} onFocus={this.handleFocus.bind(this, 1)} onBlur={this.handleBlur.bind(this, 1)} type='password' value={password}/></div>
      			<div className='denglu'><button className='' onClick={this.handleLogin.bind(this)}>{innerBtn}</button></div>
      			<div className='options'><input onChange={this.changeAutoLogin.bind(this)} type='checkbox' checked={autoLogin}/>自动登录</div>
      		</div>
      	</div>
      	{/*<div className='wave-container'><Waves /></div>*/}
      </div>
    );
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

	handleLogin() {
		this.setState({isLogining: true});
		let { onLogined } = this.props;
		let that = this;
		setTimeout(() => {
			let {username, password, autoLogin} = that.state;
			autoLogin ? storageAccount(username, password) : removeAccount();
			onLogined && onLogined(username, password, autoLogin);
		}, 2000);
	}

	startClose() { //动画结束后 移除dom
		let {close} = this.props;
		this.resetUI();
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

}

Login.propTypes = propTypes;
Login.defaultProps = defaultProps;

export default Login;
