import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import PatternCollection from './PatternCollection';
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

	shouldComponentUpdate(newProps, newState){
		return true;
		// return (newProps.filter === this.props.filter)
		// 			&& (newProps.fullView === this.props.fullView);
	}

	componentDidUpdate() {
		console.info('PatternContainer did update in', new Date() - this.d1);
	}

	componentWillUnmount(){

	}

	render(){
		this.d1 = new Date();
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
				<PatternCollection dispatch={ dispatch } />
			</div>
		</div>);
	}
}

PatternContainer.propTypes = propTypes;
PatternContainer.defaultProps = defaultProps;

let stateToProps = function(state) {
	const {layout, patterns, sort } = state;
	const {stockView, patternSmallView} = layout;
	//const {crossFilter,rawData} = patterns;
	return {fullView: !stockView, patternSmallView, patterns, sort };
};

export default connect(stateToProps)(PatternContainer);