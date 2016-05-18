import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Comparator from './Comparator';
import SearchDetail from './SearchDetail';
import { patternActions } from '../flux/actions';
import classNames from 'classnames';
import ToggleBar from '../components/ToggleBar';
import SearchWaitingWaves from '../components/SearchWaitingWaves';

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

	}

	componentWillReceiveProps(){

	}

	shouldComponentUpdate(){
		return true;
	}

	componentWillUnmount(){

	}

	toggleView(){
	this.props.dispatch(layoutActions.toggleStockView());
	}

	render(){
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
	        <div className="inner-searchreport">
	          { this.renderWaitingPanel() }
	          { this.renderDataPanels() }
	        </div>
	      </div>
	    );
	}

	renderWaitingPanel() {
	
		let { waitingForPatterns, firstStart } = this.props;
		let node = waitingForPatterns ? <SearchWaitingWaves slow={firstStart}/> : '';

		let wavesContainer = classNames('waves-container');

		return (<div className = { wavesContainer } >
			{ node }
		</div>);

	}

	renderDataPanels() {

		let dataPanelClass = classNames('search-report-wrapper', 'transition-top', 'transition-duration2', {
			'slide-down': this.props.waitingForPatterns
		});

		return (<div className={dataPanelClass} >
			<Comparator />
			<SearchDetail />
		</div>);

	}

}

SearchReport.propTypes = propTypes;
SearchReport.defaultProps = defaultProps;

let stateToProps = function(state){
	const {layout} = state;
	const {stockView, searchTimeSpent, waitingForPatterns, firstStart} = layout;
	return {
		fullView: !stockView,
		searchTimeSpent,
		waitingForPatterns,
		firstStart,
	}
};

export default connect(stateToProps)(SearchReport);
