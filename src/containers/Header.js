import React, { PropTypes } from 'react';
import Login from '../components/Login';
import {connect} from 'react-redux';
import {accountActions} from '../flux/actions';
import { removeAccount } from '../backend/localStorage';

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

	}

	componentWillReceiveProps(){

	}

	shouldComponentUpdate(){
		return true;
	}

	componentWillUnmount(){

	}
	
	renderToolbar() {
		let {account} = this.props;
		let userPanel = this.state.showUserPanel ? <div className='user-panel-container'><div>{account.username}</div><div onClick={this.handleLogout.bind(this)}>登出</div></div> : '';

		let toolbar = <div className='header-toolbar-container flex-center'>
			<button className='account-button' onBlur={this.hideUserPanel.bind(this)} onClick={this.showLoginPanel.bind(this)}><i className='fa fa-sign-in'></i>{userPanel}</button>
		</div>;
		return toolbar;
	}

	render(){
		// let {showLogin} = this.state;
		let showLogin = this.props.account.username === '';
		return <div className="container-header">
			{this.renderToolbar()}
			{showLogin ? <Login onLogined={this.handleLogined.bind(this)}/> : ''}
		</div>;
	}

	showLoginPanel() {
		let {account} = this.props;
		if(account.username == ''){
			$('.container-toggle').css('z-index', 100);
			this.setState({showLogin: true});
		} else {
			this.setState({showUserPanel: !this.state.showUserPanel});
		}
	}

	hideUserPanel() {
		this.setState({showUserPanel: false});
	}

	handleLogined(username, password, autoLogin) {
		let {dispatch} = this.props;
		dispatch(accountActions.setUser(username, password, autoLogin));
		$('.container-toggle').css('z-index', '');
		this.setState({showLogin: false});
	}

	handleLogout() {
		let {dispatch} = this.props;
		removeAccount();
		dispatch(accountActions.setUser('', '', false));
	}
}

Header.propTypes = propTypes;
Header.defaultProps = defaultProps;

let stateToProps = function(state) {
	let {account} = state;
	return {account};
}

export default connect(stateToProps)(Header);