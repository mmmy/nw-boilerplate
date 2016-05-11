import React, { PropTypes } from 'react';
import moment from 'moment';

const propTypes = {
	report: PropTypes.object,
};

const defaultProps = {

};

class ReportTypeView extends React.Component {

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

		const {searchSpace, searchDate, spaceDefinition, patternType} = this.props.report

		const startDate = searchDate[0] ? moment(searchDate[0]).format('YYYY.MM.DD') : '--';
		const endDate = searchDate[1] ? moment(searchDate[1]).format('YYYY.MM.DD') : '--';

		return (<div className="reporttype-container">
				<div className='type-item-container'>搜索空间: <span className='lulu'>{`${searchSpace}`}</span></div>
				<div className='type-item-container'>搜索时间: <span className='lulu'>{`${startDate} ~ ${endDate}`}</span></div>
				<div className='type-item-container'>空间定义: <span className='lulu'>{`${spaceDefinition}`}</span></div>
				<div className='type-item-container'>匹配形态: <span className='lulu'>{`${patternType}`}</span></div>
			</div>);
	}
}

ReportTypeView.propTypes = propTypes;
ReportTypeView.defaultProps = defaultProps;

export default ReportTypeView;
