import React, { PropTypes } from 'react';

const propTypes = {

};

const defaultProps = {
  show: true,
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
		return <div className={"transition-all container-comparator " + (this.props.stretchView ? "comparator-stretch":"")} ></div>;
	}
}

Component.propTypes = propTypes;
Component.defaultProps = defaultProps;

export default Component;