import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';

const propTypes = {
	fullView: PropTypes.bool.isRequired,
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
		const { fullView, statisticsLarger} = this.props;
		const className = classNames('transition-all', 'statistics-container', {
			'full': fullView,
			'larger': statisticsLarger,
		});
		return <div className={ className }></div>;
	}
}

Template.propTypes = propTypes;
Template.defaultProps = defaultProps;

var stateToProps = function(state) {
	const {layout} = state;
	const {stockView, patternSmallView} = layout;
	return {fullView: !stockView, statisticsLarger: patternSmallView};
};

export default connect(stateToProps)(Template);