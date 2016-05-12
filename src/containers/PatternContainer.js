import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import PatternCollection from '../components/PatternCollection';
import SortBar from '../components/SortBar';
import FilterBar from '../components/FilterBar';
import classNames from 'classnames';

const propTypes = {
	fullView: PropTypes.bool.isRequired,
	patternSmallView: PropTypes.bool
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
		const { fullView, patternSmallView, dispatch, sort, patterns } = this.props;
		const className = classNames('transition-all', 'pattern-container', {
			'full': fullView,
			'smaller': patternSmallView,
		});
		const toolbarClass = classNames('transition-all', 'pattern-toolbar-container', {
			'height0': !fullView,
			'ks-transition-height-opacity': fullView,
			'ks-show': fullView,
			'ks-hidden': !fullView,
		});
		const collectionClass = classNames('transition-all', 'pattern-collection-container', {
			'stretch': !fullView,
		});

		return (<div className={ className }>
			<div className={ toolbarClass }>
				<SortBar dispatch={dispatch} sort={sort} />
				<FilterBar dispatch={dispatch} crossFilter={patterns.crossFilter} />
			</div>
			<div className={ collectionClass }>
				<PatternCollection {...this.props} />
			</div>
		</div>);
	}
}

PatternContainer.propTypes = propTypes;
PatternContainer.defaultProps = defaultProps;

let stateToProps = function(state) {
	const {layout, patterns, filter, sort, active} = state;
	const {stockView, patternSmallView, waitingForPatterns} = layout;
	//const {crossFilter,rawData} = patterns;
	return {fullView: !stockView, patternSmallView, patterns, filter, waitingForPatterns, sort, active};
};

export default connect(stateToProps)(PatternContainer);