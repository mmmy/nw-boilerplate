import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
// import Comparator from './Comparator';
import SearchDetail from './SearchDetail';
import { patternActions, layoutActions } from '../flux/actions';
import classNames from 'classnames';
import ToggleBar from '../components/ToggleBar';
import SearchWaitingWaves from '../components/SearchWaitingWaves';
import store from '../store';
// import { callFunc } from '../components/helper/updateEchartImage';
import painter from '../ksControllers/painter';
import { afterSearchMessage } from '../ksControllers/messager.js';
import { getKlineImgSrc } from '../ksControllers/publicHelper';
import searchResultController from '../ksControllers/searchResultController';

let _isToggled = false;
let _patternChanged = false;

const propTypes = {
	dispatch: PropTypes.func.isRequired,
	fullView: PropTypes.bool,
	statisticsLarger: PropTypes.bool,

};

const defaultProps = {
	fullView : false,
};

class SearchReport extends React.Component {

	constructor(props) {
		super(props);

		this.state = {};
	}

	componentDidMount() {
		//afterSearchMessage(200, 0.001);
		// $('#__comparator_prediction_container').css('opacity', 0);
		window._restartSearch = this.restartSearch.bind(this);
	}

	componentWillReceiveProps(newProps){
		_isToggled = newProps.fullView !== this.props.fullView;
		_patternChanged = newProps.patterns !== this.props.patterns;
		if(_isToggled) {
			$(this.refs.inner_searchreport).css('opacity', '0');
			// $('#__comparator_prediction_container').css('opacity', '0');
		}
		if(newProps.patterns !== this.props.patterns) {
			let patterns = newProps.patterns;
			searchResultController.updatePrediction(patterns);
      // searchResultController.updateStatistics(patterns);
      // searchResultController.updateCharts(patterns);
		}
	}

	shouldComponentUpdate(){
		// console.log('shouldComponentUpdate');
		return true;
	}

	componentDidUpdate() {
		let { fullView, waitingForPatterns } = this.props;
		let { error } = store.getState().patterns;

		if(_patternChanged && !waitingForPatterns && ($('.pattern-view img').css('opacity') == '0')) { //fix bugs
				// console.debug('fix bugs update first 5 EChart images');
				let state = store.getState();
				// callFunc([0, 5], state.patterns && state.patterns.rawData.slice(0, 5));
		}

		$(this.refs.container).one("webkitTransitionEnd oTransitionEnd MSTransitionEnd", (e) => {
			if(!fullView && !waitingForPatterns && !_isToggled && !error && _patternChanged) {
				// console.info('SearchReport animation over');
				// console.log(e);
				let state = store.getState();
				afterSearchMessage(state.patterns.rawData.length, state.layout.searchTimeSpent);
			}
		});
		if(_isToggled) { 
			!fullView ?  $('#__comparator_prediction_container').css('opacity', '0') : '';
			$(this.refs.inner_searchreport).one("webkitTransitionEnd", () => {
				setTimeout(() => {
					$(this.refs.inner_searchreport).css('opacity', '1');
					$('#__comparator_prediction_container').css('opacity', (fullView ? '1' : '0'));
				}, 100);
			});
		}

	}

	componentWillUnmount(){

	}

	toggleView(){
	this.props.dispatch(layoutActions.toggleStockView());
	}

	render(){
		const { fullView, statisticsLarger} = this.props;
		const className = classNames('container-searchreport', {
			'searchreport-full': fullView,
		});
		// const toggleClass = classNames('container-toggle', {
		// 	'full': fullView
		// });
	    return (
	      <div className={ className }>
	        {/*<ToggleBar {...this.props} />*/}
	        <div ref='inner_searchreport' className="inner-searchreport">
	          { this.renderWaitingPanel() }
	          { this.renderDataPanels() }
	        </div>
	      </div>
	    );
	}

	renderWaitingPanel() {
	
		let { waitingForPatterns, firstStart } = this.props;

		let wavesContainer = classNames('waves-container');
		// let wavesContainer = classNames('waves-container transition-size transition-duration2');
		let node = waitingForPatterns ? <div className = { wavesContainer } ><SearchWaitingWaves slow={firstStart}/></div> : '';

		return node;

	}

	renderDataPanels() {
		let state = store.getState();
		let {error} = state.patterns;
		let kline = patternActions.getLastKline();
		let errorPanel = error ? <div className='error-panel flex-center'><img src={ getKlineImgSrc(kline) } /><div><h2>本次搜索失败了</h2><p>请您尝试<button onClick={this.restartSearch.bind(this)}>重新搜索</button>或返回<button onClick={this.resetError.bind(this)}>上一次搜索</button></p></div></div> : '';
		let dataPanelClass = classNames('search-report-wrapper', 'transition-top', 'transition-duration2', {
			'slide-down': this.props.waitingForPatterns,
			'transition-delay3': !this.props.waitingForPatterns,
			'small': !this.props.fullView
		});

		return (<div className={dataPanelClass} ref='container'>
			{/*<Comparator />*/}
			{/*<div className='container-comparator container-comparator-stretch'></div>*/}
			<SearchDetail />
			{errorPanel}
		</div>);

	}

	restartSearch() {
		let {dispatch} = this.props;
		dispatch(layoutActions.waitingForPatterns());
		dispatch(patternActions.getPatterns({}));
	}

	resetError() {
		let {dispatch} = this.props;
		dispatch(patternActions.resetError());
		this.setState({});
	}

}

SearchReport.propTypes = propTypes;
SearchReport.defaultProps = defaultProps;

let stateToProps = function(state){
	const {layout, patterns} = state;
	const {stockView, searchTimeSpent, waitingForPatterns, firstStart} = layout;
	return {
		fullView: !stockView,
		searchTimeSpent,
		waitingForPatterns,
		firstStart,
		patterns,
	}
};

export default connect(stateToProps)(SearchReport);
