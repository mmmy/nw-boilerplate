import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import ReportDetailView from '../components/ReportDetailView';
import ReportTypeView from '../components/ReportTypeView';
import CrossfilterView from '../components/CrossfilterView';

const propTypes = {
	fullView: PropTypes.bool.isRequired,
	report: PropTypes.object,
	crossFilter: PropTypes.object.isRequired,
	dispatch: PropTypes.func.isRequired,
};

const defaultProps = {

};

class statisticsContainer extends React.Component {

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

	componentDidUpdate() {
		//console.log('statisticsContainer did update', new Date() - this.renderDate);
	}

	render(){
		this.renderDate = new Date();
		const { fullView, statisticsLarger, report, crossFilter, dispatch, filter} = this.props;
		const className = classNames('transition-all', 'statistics-container', {
			'full': fullView,
			'larger': statisticsLarger,
		});

		const fistReportClass = classNames('transition-all', 'transition-delay2','report-container-wrap',{
			'stretch': !fullView
		});
		
		const reportClass2 = classNames('report-container-wrap', {
			'ks-hidden': !fullView,
			//'transition-delay0': !fullView,
			'ks-fade-in': fullView,
			'ks-show': fullView
		});

		const reportClass3 = classNames('reporttype-container-wrap', {
			'ks-hidden': !fullView,
			//'transition-delay0': !fullView,
			'ks-fade-in': fullView,
			'ks-show': fullView
		});

	    return (
	      <div className={ className }>
	        <div className={fistReportClass}><ReportDetailView crossFilter={crossFilter} fullView={fullView}/></div>
	        {/*<div className={reportClass2}><ReportDetailView report={report} fullView={true}/></div>*/}
	        <div className={reportClass3}><ReportTypeView report={report} /></div>
	        <div className={'crossfilter-container-wrap'}>
	          <CrossfilterView
	            dispatch={dispatch}
	            crossFilter={crossFilter}
	            stretchView={fullView} />
	        </div>
	      </div>
	    );
	}
}

statisticsContainer.propTypes = propTypes;
statisticsContainer.defaultProps = defaultProps;

let stateToProps = function(state) {
	const {layout, report, patterns, filter} = state;
	const {stockView, patternSmallView} = layout;
	const {crossFilter} = patterns;
	return {
			fullView: !stockView,
			statisticsLarger: patternSmallView,
			crossFilter,
			report,
			filter,
		};
};

export default connect(stateToProps)(statisticsContainer);
