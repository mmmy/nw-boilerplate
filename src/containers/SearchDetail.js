import React, { PropTypes } from 'react';

const propTypes = {

};

const defaultProps = {
  
};

class Component extends React.Component {

	constructor(props) {
		super(props);
		this.defaultProps = {

		};
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
		return <div className={"transition-all container-searchdetail " + (this.props.shrinkView ? "searchdetail-shrink":"")}></div>;
	}
}

Component.propTypes = propTypes;
Component.defaultProps = defaultProps;

export default Component;