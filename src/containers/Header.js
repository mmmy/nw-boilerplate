import React, { PropTypes } from 'react';

class Component extends React.Component {

	constructor(props) {
		super(props);
		this.defaultProps = {

		};

		this.state= {};
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
		return <div className="container-header"></div>;
	}
}

export default Component;