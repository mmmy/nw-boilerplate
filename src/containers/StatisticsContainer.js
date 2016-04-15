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

	componentDidUpdate() {
		console.log('statisticsContainer did update', new Date() - this.renderDate);
	}

	render(){
		this.renderDate = new Date();
		const { fullView, statisticsLarger, report, crossFilter, dispatch} = this.props;
		const className = classNames('transition-all', 'statistics-container', {
			'full': fullView,
			'larger': statisticsLarger,
		});

		const fistReportClass = classNames('transition-all', 'transition-delay2','report-container-wrap',{
			'stretch': !fullView
		});
    return (
      <div className={ className }>
        <div className={fistReportClass}><ReportDetailView report={report} /></div>
        <div className={'report-container-wrap'}><ReportDetailView report={report} /></div>
        <div className={'report-container-wrap'}><ReportTypeView report={report} /></div>
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

Template.propTypes = propTypes;
Template.defaultProps = defaultProps;

let stateToProps = function(state) {
	const {layout, report, patterns} = state;
	const {stockView, patternSmallView} = layout;
	const {crossFilter} = patterns;
	return {
			fullView: !stockView,
			statisticsLarger: patternSmallView,
			crossFilter,
			report,
		};
};

export default connect(stateToProps)(Template);
