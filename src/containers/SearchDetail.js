import React, { PropTypes } from 'react';
import PatternContainer from './PatternContainer';
import StatisticsContainer from './StatisticsContainer';
import {connect} from 'react-redux';
import classNames from 'classnames';

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
		let className = classNames('transition-all', 'container-searchdetail', {
			'searchdetail-shrink': this.props.shrinkView,
		});
		return <div className={ className }>
			<StatisticsContainer />
			<PatternContainer />
		</div>;
	}
}

Component.propTypes = propTypes;
Component.defaultProps = defaultProps;


var stateToProps = function(state) {
	const {layout} = state;
	const {stockView} = layout;
	return {
		shrinkView: !stockView,
	};
};

export default connect(stateToProps)(Component);