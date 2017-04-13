import React, { PropTypes } from 'react';
// import LoginSmall from '../components/LoginSmall';
import {connect} from 'react-redux';
import {accountActions} from '../flux/actions';
import classNames from 'classnames';
import { removeAccount } from '../backend/localStorage';
import nwApp from '../shared/nwApp';
import pkg from '../../package.json';

const propTypes = {
	stretchView: PropTypes.bool,
	account: PropTypes.object,
};

const defaultProps = {

};

class Header extends React.Component {

	constructor(props) {
		super(props);
		this.defaultProps = {

		};

		this.state= {showLogin: true, fullScreen: false};
	}


	componentDidMount() {
		// let isMouseDown = false;
		// let lastOffsetX = 0;
		// let lastOffsetY = 0;
		// if($(this.refs.container_header).find('.app-drag-area').length == 0) {
		// 	// $(this.refs.container_header).prepend(`<div class='app-drag-area' style='-webkit-app-region:drag'></div>`);		
		// }
		// $(this.refs.drag_area).mousedown(function(event) {
		// 	/* Act on the event */
		// 	isMouseDown = true;
		// 	lastOffsetX = event.offsetX;
		// 	lastOffsetY = event.offsetY;
		// });
		// $(this.refs.drag_area).mousemove(function(event) {
		// 	/* Act on the event */
		// 	let dx = event.offsetX - lastOffsetX;
		// 	let dy = event.offsetY - lastOffsetY;
		// 	if(isMouseDown) {
		// 		console.log(event,dx,dy,'header mousemove')

		// 		nwApp.appMoveTo(event.screenX - event.offsetX + dx, event.screenY - event.offsetY + dy);
		// 	}
		// });
		// $(this.refs.drag_area).mouseup(function(event) {
		// 	/* Act on the event */
		// 	isMouseDown = false
		// });

	}

	componentWillReceiveProps(){

	}

	shouldComponentUpdate(newProps){
		if(newProps.account !== this.props.account){
			if(newProps.account.username === '') {
				this.setState({showLogin: true});
			}else{
				// this.refs.login_panel.startClose();
			}
			return false;
		}
		return true;
	}

	componentWillUnmount(){

	}
	
	renderToolbar() {
		let {account} = this.props;
		let loginState = account.loginState;
		let userPanel = this.state.showUserPanel 
											? 
											<div className='user-panel-container'>
												<div className='username'>{account.username}</div>
												<div className='userType red'>{loginState && loginState.userType && loginState.userType.toUpperCase() == 'VIP' ? 'VIP用户' : '试用账户'}</div>
												<div className='days-remain red'>有效期剩余 {loginState && loginState.expireInDay} 天</div>
												<a className='link change-password' onClick={this.changePassword}>更改密码</a>
												<hr />
												<div className='version'>当前版本: {pkg.version}</div>
												<a className='link udpate-log' onClick={this.showUpdateLog}>更新日志</a>
												<div className="logout-btn" onClick={this.handleLogout.bind(this)}>登出</div>
											</div> 
											: 
											'';

		let toolbar = <div className='header-toolbar-container flex-center' onMouseUp={function(e){ e.stopPropagation(); }}>
			<button className='account-button' onBlur={this.hideUserPanel.bind(this)} onClick={this.showLoginPanel.bind(this)}>{userPanel}</button>
		</div>;
		return toolbar;
	}

	renderAppTool() {
		let className = classNames('flat-btn button app-maximize', {fullScreen: this.state.fullScreen});
		let node = null;
		if($(document.body).hasClass('mac')) {
			node = <div className="app-tool-container">
				<button className='flat-btn button app-close' onClick={this.handleAppClose.bind(this)}></button>
				<button className='flat-btn button app-minimize' onClick={this.handleAppMinimize.bind(this)}></button>
				<button ref='app_maximize' className={className} onClick={this.handleAppToggleMaximize.bind(this)}></button>
			</div>
		} else {
			node = <div className='app-tool-container'>
				<button className='flat-btn button app-minimize' onClick={this.handleAppMinimize.bind(this)}></button>
				<button ref='app_maximize' className={className} onClick={this.handleAppToggleMaximize.bind(this)}></button>
				<button className='flat-btn button app-close' onClick={this.handleAppClose.bind(this)}></button>
			</div>
		}
		return node;
	}

	render(){
		let {showLogin} = this.state;
		// let showLogin = this.props.account.username === '';
		return <div className="container-header" ref='container_header'>
			<div className='app-drag-area' ref='drag_area'></div>
			<span className='header-icon'></span>
			{this.renderToolbar()}
			{this.renderAppTool()}
			{/*showLogin ? <LoginSmall ref='login_panel' onLogined={this.handleLogined.bind(this)} close={this.closeLogModal.bind(this)}/> : '' */}
		</div>;
	}

	showLoginPanel() {
		let {account} = this.props;
		if(account.username == ''){
			// $('.container-toggle').css('z-index', 100);
			this.setState({showLogin: true});
		} else {
			this.setState({showUserPanel: !this.state.showUserPanel});
		}
	}

	hideUserPanel() {
		this.setState({showUserPanel: false});
	}

	handleLogined(info, cb) {
		let {dispatch} = this.props;
		dispatch(accountActions.setUser(info));
		// $('.container-toggle').css('z-index', '');
		  //检查用户过期信息
	  if(require('../ksControllers/trialReminder').check(info)) {
	    //没有过期
	  }
		cb && cb();
	}

	closeLogModal() {
		this.setState({showLogin: false});
	}

	handleLogout() {
		let {dispatch} = this.props;
		removeAccount();
		dispatch(accountActions.setUser('', '', false));
		let login = require('../login');
		login.showLogin(this.handleLogined.bind(this));
		// let patterns = {
		// 	rawData: [],
		// 	closePirce: [],
		// 	error: null,
		// 	searchConfig: null,
		// };
		// dispatch({type: 'CHANGE_PATTERNS', patterns, searchTimeSpent:0});
	}

	handleAppMinimize() {
		nwApp.appMinimize();
	}

	handleAppToggleMaximize() {
		if($(this.refs.app_maximize).hasClass('fullScreen')) {
			nwApp.appUnMaximize();
		} else {
			nwApp.appMaximize();	
		}
	}

	handleAppToggleFullScreen() {
		nwApp.appToggleFullScreen();
		// let fullScreen = this.state.fullScreen;
		// this.setState({fullScreen: !fullScreen});
	}

	handleAppClose() {
		nwApp.appClose();
	}

	showUpdateLog() {
		require('../ksControllers/updateLog').show();
	}

	changePassword() {
		require('../ksControllers/changePassword').show();
	}
}

Header.propTypes = propTypes;
Header.defaultProps = defaultProps;

let stateToProps = function(state) {
	let {account} = state;
	return {account};
}

export default connect(stateToProps)(Header);