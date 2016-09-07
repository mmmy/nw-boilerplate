import React, { PropTypes } from 'react';
// import { connect } from 'react-redux';
import classNames from 'classnames';
import nwApp from '../shared/nwApp';

const propTypes = {

};

const defaultProps = {
  
};

class TitleBar extends React.Component {

	constructor(props) {
		super(props);
		this.state = {};
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

	handleAppMinimize() {
		nwApp.appMinimize();
	}

	handleAppMaximize() {
		nwApp.appMaximize();
	}

	handleAppClose() {
		nwApp.appClose();
	}

	render(){
		let className = classNames('title-bar-container');
		return (<div className={ className } style={{'-webkit-app-region':'drag'}}>
			<button className='flat-btn button app-minimize' onClick={this.handleAppMinimize.bind(this)}></button>
			<button className='flat-btn button app-maximize' onClick={this.handleAppMaximize.bind(this)}></button>
			<button className='flat-btn button app-close' onClick={this.handleAppClose.bind(this)}></button>
		</div>);
	}
}

TitleBar.propTypes = propTypes;
TitleBar.defaultProps = defaultProps;

// let stateToProps = function(state) {
// 	return {};
// };

// export default connect(stateToProps)(TitleBar);
export default TitleBar;
