import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import ReportDetailView from '../components/ReportDetailView';
import ReportTypeView from '../components/ReportTypeView';
import CrossfilterView from '../components/CrossfilterView';

const propTypes = {
	fullView: PropTypes.bool.isRequired,
};

const defaultProps = {
  
};

class Template extends React.Component {

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
		const { fullView, statisticsLarger, report, statistics} = this.props;
		const className = classNames('transition-all', 'statistics-container', {
			'full': fullView,
			'larger': statisticsLarger,
		});

		const fistReportClass = classNames('transition-all', 'transition-delay2','report-container-wrap',{
			'stretch': !fullView
		});
		return (<div className={ className }>
			<div className={fistReportClass}><ReportDetailView reprot={report} /></div>
			<div className={'report-container-wrap'}><ReportDetailView reprot={report} /></div>
			<div className={'report-container-wrap'}><ReportTypeView reprot={report} /></div>
			<div className={'crossfilter-container-wrap'}><CrossfilterView statistics={statistics} /></div>
		</div>);
	}
}

Template.propTypes = propTypes;
Template.defaultProps = defaultProps;

var stateToProps = function(state) {
	const {layout, report, statistics} = state;
	const {stockView, patternSmallView} = layout;
	return {
			fullView: !stockView, 
			statisticsLarger: patternSmallView,
			statistics,
			report,
		};
};

export default connect(stateToProps)(Template);