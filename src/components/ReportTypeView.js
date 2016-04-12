import React, { PropTypes } from 'react';

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
		return <div className="reporttype-container"></div>;
	}
}

Template.propTypes = propTypes;
Template.defaultProps = defaultProps;

export default Template;