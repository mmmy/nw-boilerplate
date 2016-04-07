import React, { PropTypes } from 'react';
import classNames from 'classnames';
import {connect} from 'react-redux';

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
		let calssName = classNames('transition-all','container-comparator',{
			'comparator-stretch': this.props.stretchView,
		});
		return <div className={ calssName } ></div>;
	}
}

Component.propTypes = propTypes;
Component.defaultProps = defaultProps;

var stateToProps = function(state) {
	const {layout} = state;
	const {stockView} = layout;
	return {
		stretchView: !stockView,
	};
};
export default connect(stateToProps)(Component);