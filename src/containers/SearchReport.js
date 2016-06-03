import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Comparator from './Comparator';
import SearchDetail from './SearchDetail';
import { patternActions, layoutActions } from '../flux/actions';
import classNames from 'classnames';
import ToggleBar from '../components/ToggleBar';
import SearchWaitingWaves from '../components/SearchWaitingWaves';
import store from '../store';

let afterSearchMessage = (number, timeSpent) => {
	const time = (timeSpent/1000).toFixed(3);
	let msgNode = $(`<div class="search-message-container slide-up-down">拱石为你找到匹配图形<span class="number">${number}</span>个，用时<span>${time}</span>秒</div>`);
	msgNode.appendTo(window.document.body);
	msgNode.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', () => {
		//console.log('afterSearchMessage container animation ended----====-----');
		msgNode.remove();
	});
};

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
	}

	componentWillReceiveProps(newProps){
		_isToggled = newProps.fullView !== this.props.fullView;
		_patternChanged = newProps.patterns !== this.props.patterns;
		if(_isToggled) {
			$(this.refs.inner_searchreport).css('opacity', '0');
			// $('#__comparator_prediction_container').css('opacity', '0');
		}
	}

	shouldComponentUpdate(){
		// console.log('shouldComponentUpdate');
		return true;
	}

	componentDidUpdate() {
		console.info('SearchReport did update in:', new Date() - this.d1);
		let { fullView, waitingForPatterns } = this.props;
		let { error } = store.getState().patterns;

		$(this.refs.container).one("webkitTransitionEnd oTransitionEnd MSTransitionEnd", (e) => {
			if(!fullView && !waitingForPatterns && !_isToggled && !error && _patternChanged) {
				console.info('SearchReport animation over');
				console.log(e);
				let state = store.getState();
				afterSearchMessage(state.patterns.rawData.length, state.layout.searchTimeSpent);
			}
		});
		_isToggled && $(this.refs.inner_searchreport).one("webkitTransitionEnd", () => {
			setTimeout(() => {
				$(this.refs.inner_searchreport).css('opacity', '1');
				$('#__comparator_prediction_container').css('opacity', (fullView ? '1' : '0'));
			}, 100);
		});

	}

	componentWillUnmount(){

	}

	toggleView(){
	this.props.dispatch(layoutActions.toggleStockView());
	}

	render(){
		this.d1 = new Date();
		const { fullView, statisticsLarger} = this.props;
		const className = classNames('transition-all', 'container-searchreport', {
			'searchreport-full': fullView,
		});
		const toggleClass = classNames('container-toggle', {
			'full': fullView
		});
	    return (
	      <div className={ className }>
	        <ToggleBar {...this.props} />
	        <div ref='inner_searchreport' className="inner-searchreport">
	          { this.renderWaitingPanel() }
	          { this.renderDataPanels() }
	        </div>
	      </div>
	    );
	}

	renderWaitingPanel() {
	
		let { waitingForPatterns, firstStart } = this.props;

		let wavesContainer = classNames('waves-container transition-all transition-duration2');
		let node = waitingForPatterns ? <div className = { wavesContainer } ><SearchWaitingWaves slow={firstStart}/></div> : '';

		return node;

	}

	renderDataPanels() {
		let state = store.getState();
		let {error} = state.patterns;
		let errorPanel = error ? <div className='error-panel flex-center'><img src='./image/kline.png' /><div><h2>本次搜索失败了</h2><p>请您尝试<button onClick={this.restartSearch.bind(this)}>重新搜索</button>或返回<button onClick={this.resetError.bind(this)}>上一次搜索</button></p></div></div> : '';
		let dataPanelClass = classNames('search-report-wrapper', 'transition-top', 'transition-duration2', {
			'slide-down': this.props.waitingForPatterns,
			'transition-delay3': !this.props.waitingForPatterns,
		});

		return (<div className={dataPanelClass} ref='container'>
			<Comparator />
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
