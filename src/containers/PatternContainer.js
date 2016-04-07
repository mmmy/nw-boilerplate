import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import PatternCollection from '../components/PatternCollection';
import classNames from 'classnames';

const propTypes = {
	fullView: PropTypes.bool.isRequired,
};

const defaultProps = {
  
};

class PatternContainer extends React.Component {

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
		const { fullView, patternSmallView } = this.props;
		const className = classNames('transition-all', 'pattern-container', {
			'full': fullView,
			'smaller': patternSmallView,
		});
		return <div className={ className }>
			<div></div>
			<PatternCollection />
		</div>;
	}
}

PatternContainer.propTypes = propTypes;
PatternContainer.defaultProps = defaultProps;

var stateToProps = function(state) {
	const {layout} = state;
	const {stockView, patternSmallView} = layout;
	return {fullView: !stockView, patternSmallView};
};

export default connect(stateToProps)(PatternContainer);