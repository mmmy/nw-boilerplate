import React, { PropTypes } from 'react';
// import LoginSmall from '../components/LoginSmall';
import {connect} from 'react-redux';
import {accountActions} from '../flux/actions';
import { removeAccount } from '../backend/localStorage';
import nwApp from '../shared/nwApp';

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

		this.state= {showLogin: true};
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
		let userPanel = this.state.showUserPanel ? <div className='user-panel-container'><div className='username'>{account.username}</div><div className="logout-btn" onClick={this.handleLogout.bind(this)}>登出</div></div> : '';

		let toolbar = <div className='header-toolbar-container flex-center'>
			<button className='account-button' onBlur={this.hideUserPanel.bind(this)} onClick={this.showLoginPanel.bind(this)}>{userPanel}</button>
		</div>;
		return toolbar;
	}

	renderAppTool() {
		let node = <div className='app-tool-container'>
			<button className='flat-btn button app-minimize' onClick={this.handleAppMinimize.bind(this)}></button>
			<button className='flat-btn button app-maximize' onClick={this.handleAppToggleFullScreen.bind(this)}></button>
			<button className='flat-btn button app-close' onClick={this.handleAppClose.bind(this)}></button>
		</div>
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

	handleLogined(username, password, autoLogin, cb) {
		let {dispatch} = this.props;
		dispatch(accountActions.setUser(username, password, autoLogin));
		// $('.container-toggle').css('z-index', '');
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

	handleAppMaximize() {
		nwApp.appMaximize();
	}

	handleAppToggleFullScreen() {
		nwApp.appToggleFullScreen();
	}

	handleAppClose() {
		nwApp.appClose();
	}
}

Header.propTypes = propTypes;
Header.defaultProps = defaultProps;

let stateToProps = function(state) {
	let {account} = state;
	return {account};
}

export default connect(stateToProps)(Header);