import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import PatternCollection from './PatternCollection';
import SortBar from '../components/SortBar';
import FilterBar from '../components/FilterBar';
import PatternStatisticsPanel from './PatternStatisticsPanel';
import classNames from 'classnames';

const propTypes = {
	fullView: PropTypes.bool.isRequired,
	patternSmallView: PropTypes.bool
};

const defaultProps = {
  
};

let _slideStatisticsNode = null;

class PatternContainer extends React.Component {

	constructor(props) {
		super(props);
		this.state = {};
	}

	componentDidMount() {

		let parentNode = $(this.refs.pattern_statistics_container);
		let childNode = $(`<div class='transition-all transition-ease transition-duration1000 statistics-slide-widget flex'><button><i class='fa fa-trash'></i>一键剔除</button><i class='fa fa-chevron-down'></i></div>`);
		let childrenBtn = childNode.children();

		let that = this;
		childrenBtn[0].onclick = () => {
			let a = that;
			let visiblePatternViews = $('.pattern-view:visible','.pattern-collection');
			let idArr = [];
			visiblePatternViews.map((i, patternView) => {
				let idStr = patternView.id;
				idArr.push(parseInt(idStr.replace('pattern_view_','')));
			});
			that.refs.pattern_collection.stateProps._setIdTrashed(idArr, true);
		};
		childrenBtn[1].onclick = () => {
			childNode.removeClass('slide-up');
		}
		parentNode.prepend(childNode);

		_slideStatisticsNode = childNode;

	}

	componentWillReceiveProps(){

	}

	shouldComponentUpdate(newProps, newState){
		if (newProps.filter !== this.props.filter) {
			_slideStatisticsNode && _slideStatisticsNode.addClass('slide-up');
			return false;
		}
		return true;
		// return (newProps.filter === this.props.filter)
		// 			&& (newProps.fullView === this.props.fullView);
	}

	componentDidUpdate() {
		console.info('PatternContainer did update in', new Date() - this.d1);
	}

	componentWillUnmount(){

	}

	trashAll() {
		let visiblePatternViews = $('.pattern-view:visible','.pattern-collection');
		let idArr = [];
		visiblePatternViews.map((i, patternView) => {
			let idStr = patternView.id;
			idArr.push(parseInt(idStr.replace('pattern_view_','')));
		});
		this.refs.pattern_collection.stateProps._setIdTrashed(idArr, true);
	}

	resetAllTrash() {
		let trashedNodes = $('.trashed-info', '.pattern-collection').parent().parent().parent();
		let idArr = [];
		trashedNodes.map((i, patternView) => {
			let idStr = patternView.id;
			idArr.push(parseInt(idStr.replace('pattern_view_','')));
		});
		this.refs.pattern_collection.stateProps._setIdTrashed(idArr, false);
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
		const patternInfoClass = classNames('transition-all', 'pattern-statistics-container', {
			'ks-transition-height-opacity': fullView,
			'ks-show': fullView,
			'ks-hidden': !fullView,
		});
		return (<div className={ className }>
			<div className={ toolbarClass }>
				<SortBar crossFilter={patterns.crossFilter} dispatch={dispatch} sort={sort} />
				{/*<FilterBar dispatch={dispatch} crossFilter={patterns.crossFilter} />*/}
			</div>
			<div className={ collectionClass }>
				<PatternCollection ref='pattern_collection' dispatch={ dispatch } />
			</div>
			<div ref='pattern_statistics_container' className={ patternInfoClass }>
				<PatternStatisticsPanel onTrash={this.trashAll.bind(this)} resetAll={this.resetAllTrash.bind(this)}/>
			</div>
		</div>);
	}
}

PatternContainer.propTypes = propTypes;
PatternContainer.defaultProps = defaultProps;

let stateToProps = function(state) {
	const {layout, patterns, sort, filter } = state;
	const {stockView, patternSmallView} = layout;
	//const {crossFilter,rawData} = patterns;
	return {fullView: !stockView, patternSmallView, patterns, sort, filter};
};

export default connect(stateToProps)(PatternContainer);