import React, { PropTypes } from 'react';
import classNames from 'classnames';
import store from '../store';
import { connect } from 'react-redux';

const propTypes = {
	dispatch: PropTypes.func.isRequired,
	crossFilter: PropTypes.object.isRequired,
	showTrashPanel: PropTypes.func,
	// onTrash: PropTypes.func,
	// resetAll: PropTypes.func,
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

	showTrashPanel() {
		let that = this;
		let parent = $(this.refs.trash_panel_container);
		let panel = $(`<div class='trash-panel-container'></div>`);

		let trashedNodes = $('.trashed-info', '.pattern-collection').parent().parent().parent().clone(false, false).removeClass('hide');
		let button = $('<div>reset all</div>');
		button.click(()=>{
			that.props.resetAll && that.props.resetAll();
			$('.pattern-view',panel).remove();
			that.removeTrashPanel();
		});
		panel.append(trashedNodes).append(button);

		parent.append(panel);
		$(window.document.body).append(`<div id='__modal_overlay' class='modal-overlay'></div>`);
		// panel.addClass('animated slideInRight');
	}

	removeTrashPanel() {
		let panel = $('.trash-panel-container', this.refs.trash_panel_container);
		panel.animateCss('slideOutRight', () => { panel.remove() });
		$('#__modal_overlay').remove();
		// panel.remove();
	}

	render(){
		let { filterNumber, total } = this.statisticsData();
		let { trashedNumber, showTrashPanel } = this.props;
		return (
      <div className="pattern-statistics-panel flex font-simsun">
      	<span>筛选结果:<span className='black font-number'>{filterNumber}</span>{/*<button onClick={onTrash}><i className='fa fa-trash'></i></button>*/}</span>
      	<span>结果总数:<span className='black font-number'>{total}</span></span>
      	<span><button data-kstooltip="查看剔除的图形" className='trash-all-button' ref='trash_panel_container' onClick={showTrashPanel} onBlur={this.removeTrashPanel.bind(this)}><i className='fa fa-trash'></i><span className='trashed-number'>{trashedNumber}</span></button></span>
      </div>
    );
	}
}

PatternStatisticsPanel.propTypes = propTypes;
PatternStatisticsPanel.defaultProps = defaultProps;

let stateToProps = function(state) {
	const {filter, patterns} = state;
	let {crossFilter} = patterns;
	// let {trashedNumber} = patternTrashed;
	//const {stockView, patternSmallView} = layout;
	//const {crossFilter,rawData} = patterns;
	return {crossFilter, filter };
};

export default connect(stateToProps)(PatternStatisticsPanel);
