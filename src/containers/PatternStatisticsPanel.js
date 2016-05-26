import React, { PropTypes } from 'react';
import classNames from 'classnames';
import store from '../store';
import { connect } from 'react-redux';

const propTypes = {
	dispatch: PropTypes.func.isRequired,
	crossFilter: PropTypes.object.isRequired,
};

const defaultProps = {

};

class PatternStatisticsPanel extends React.Component {

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

	statisticsData() {
		let state = store.getState();
		let total = state.patterns.rawData && state.patterns.rawData.length || 0;
		let { crossFilter } = this.props;

		if (this._oldCrossFilter !== crossFilter) {
			this.symbolDim = crossFilter.dimension((d) => { return d.symbol; });
			this._oldCrossFilter = crossFilter;
		}

		let filterNumber = this.symbolDim.top(Infinity).length;

		return { filterNumber, total };
	}

	render(){
		let { filterNumber, total } = this.statisticsData();
		return (
      <div className="pattern-statistics-panel flex">
      	<span>筛选结果:<span className='black font-number'>{filterNumber}</span></span>
      	<span>搜索结果总数:<span className='black font-number'>{total}</span></span>
      </div>
    );
	}
}

PatternStatisticsPanel.propTypes = propTypes;
PatternStatisticsPanel.defaultProps = defaultProps;

let stateToProps = function(state) {
	const {filter, patterns} = state;
	let {crossFilter} = patterns;
	//const {stockView, patternSmallView} = layout;
	//const {crossFilter,rawData} = patterns;
	return {crossFilter, filter };
};

export default connect(stateToProps)(PatternStatisticsPanel);
