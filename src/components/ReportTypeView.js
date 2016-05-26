import React, { PropTypes } from 'react';
import moment from 'moment';

const propTypes = {
	report: PropTypes.object,
	searchConfig: PropTypes.object.isRequired,
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

		const {searchSpace, dateRange, spaceDefinition, matchType} = this.props.searchConfig;

		const startDate = dateRange[0] ? moment(dateRange[0]).format('YYYY.MM.DD') : '--';
		const endDate = dateRange[1] ? moment(dateRange[1]).format('YYYY.MM.DD') : '--';

		let spaceDefinitionStr = (spaceDefinition.stock ? '股票' : '') + (spaceDefinition.furture ? ' 期货' : '');
		spaceDefinitionStr = spaceDefinitionStr || '--';
		return (<div className="reporttype-container">
				<div className='type-item-container'>搜索空间: <span className='lulu'>{`${searchSpace}`}</span></div>
				<div className='type-item-container'>搜索时间: <span className='lulu'>{`${startDate} ~ ${endDate}`}</span></div>
				<div className='type-item-container'>空间定义: <span className='lulu'>{`${spaceDefinitionStr}`}</span></div>
				<div className='type-item-container'>匹配形态: <span className='lulu'>{`${matchType}`}</span></div>
			</div>);
	}
}

ReportTypeView.propTypes = propTypes;
ReportTypeView.defaultProps = defaultProps;

export default ReportTypeView;
