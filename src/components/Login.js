import React, { PropTypes } from 'react';
import Waves from './SearchWaitingWaves';
import classNames from 'classnames';

const propTypes = {
	onLogined: PropTypes.func,
};

const defaultProps = {

};

class Login extends React.Component {

	constructor(props) {
		super(props);
		this.state = {isLogining: false, username: '', password:'', autoLogin: false};
	}

	componentDidMount() {

	}

	componentWillReceiveProps(){

	}

	shouldComponentUpdate(){
		return true;
	}

	componentWillUnmount(){

	}

	render(){
		let { isLogining, username, password, autoLogin } = this.state;
		let innerBtn = isLogining ? <i className='fa fa-spinner fa-spin'></i> : '登陆';
		return (
      <div className='login-panel-container'>
      	<div className='body-container'>
      		<div className='logo'></div>
      		<div>
      			<div className='user-name' ><span className='placeholder transition-all transition-ease' ref='holder_username'>用户名</span><input onChange={this.changeUsernamne.bind(this)} onFocus={this.handleFocus.bind(this, 0)} onBlur={this.handleBlur.bind(this, 0)} type='text' value={username}/></div>
      			<div className='password' ><span className='placeholder transition-all transition-ease' ref='holder_password'>密码</span><input onChange={this.changePassword.bind(this)} onFocus={this.handleFocus.bind(this, 1)} onBlur={this.handleBlur.bind(this, 1)} type='password' value={password}/></div>
      			<div className='denglu'><button className='' onClick={this.handleLogin.bind(this)}>{innerBtn}</button></div>
      			<div className='options'><input onChange={this.changeAutoLogin.bind(this)} type='checkbox' checked={autoLogin}/>自动登陆</div>
      		</div>
      	</div>
      	<div className='wave-container'><Waves /></div>
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
		let {username, password, autoLogin} = this.state;
		setTimeout(() => {
			onLogined && onLogined(username, password, autoLogin);
		}, 3000);
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
