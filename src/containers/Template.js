import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';

const propTypes = {

};

const defaultProps = {
  
};

class Template extends React.Component {

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

	render(){
		let className = classNames();
		return (<div className={ className }></div>);
	}
}

Template.propTypes = propTypes;
Template.defaultProps = defaultProps;

let stateToProps = function(state) {
	return {};
};

export default connect(stateToProps)(Template);