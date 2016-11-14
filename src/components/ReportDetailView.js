import React, { PropTypes } from 'react';
import classNames from 'classnames';
import statisticKline from './utils/statisticKline';
import { getDecimalForStatistic } from '../shared/storeHelper';

let stopPropagationHelper =(e) => {
	if(e && e.stopPropagation) {
		e.stopPropagation();
	}
};

const propTypes = {
	crossFilter: PropTypes.object.isRequired,
	//report: PropTypes.object.isRequired,
	fullView: PropTypes.bool,
};

const defaultProps = {
  	fullView: true
};

const TYPES = ['涨跌','上涨','下跌'];

class ReportDetailView extends React.Component {

	constructor(props) {
		super(props);
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
		let { fullView } = this.props;

		if (fullView) {
			$('.__fadeIn').animateCss('fadeIn');
		}
	}

	generateItem({title, items}){

		let {fullView} = this.props;

		const titleClass = classNames('item-title', 'transition-all', { 's2': !fullView});
		const bodyClass = classNames('flex-container', 'body-container', 'transition-all', { 's2': !fullView});

		return (<div className='item-container'>
			{ title ? <h5 className={titleClass}>{title}</h5> : '' }
			<div className={bodyClass}>
				{items.map((e, i) => {
					let color = e.redColor === undefined ? '' : (e.redColor===true ? 'red':'green');
					return (<div className='item-body' key={(title=='下跌') ? (i+4) : i}>
							<div className='item-name'>{e.name}</div>
							<div className='__fadeIn item-data font-number' style={{color:color}}>{e.content}</div>
						</div>);
				})}
			</div>
		</div>);
	}

	getStatisticsData() {

		let { crossFilter } = this.props;

		if (this._oldCrossFilter !== crossFilter) {
			this.symbolDim = crossFilter.dimension((d) => { return d.symbol; });
			this._oldCrossFilter = crossFilter;
		}

		let kline = this.symbolDim.top(Infinity);

		let data = statisticKline(kline);

		return data;

	}

	render(){
		
		const { fullView } = this.props;
		//const { sampleSize, riseProbability, earningAverage, median, profitRiskRate, forecastCeilBound, forecastFloorBound } = report;
		const decaimal = getDecimalForStatistic();

		let data = this.getStatisticsData();
		let { median, mean, upPercent, up, down } = data;

		let className = classNames('reportdetail-container');
		
		let upClass = classNames('report-item', 'result-item-righttop', {
			'ks-hidden': !fullView,
			//'transition-delay0': !fullView,
			'ks-fade-in': fullView,
			'ks-show': fullView
		});
		
		let titleClassName = classNames('title font-msyh', {
			'hide': false,//fullView
		});

		let downClass = classNames('report-item', 'result-item-rightbottom', {
			'ks-hidden': !fullView,
			//'transition-delay0': !fullView,
			'ks-fade-in': fullView,
			'ks-show': fullView
		});

		return (<div className={className}>
			<div className='header-container' tabIndex='0' ref='header_container'>
				<span className={titleClassName}>历史指标统计</span>
			</div>
			{fullView ? '' : [<span className='split-line l1'></span>, <span className='split-line l2'></span>, <span className='split-line l3'></span>]}
			<div className='statistic-data-container'>
				<div className='statistic-data-container-inner ks-container'>
					{/*this.generateCells()*/}
					{this.getDataNodes()}
				</div>
			</div>
		</div>);
	}

	getDataNodes() {
		const decimal = getDecimalForStatistic();
		let data = this.getStatisticsData();
		let { median, mean, upPercent, up, down } = data;
		let that = this;
		let dataArr1 = [
			{name:'上涨比例', value:upPercent},
			{name:'下跌比例', value:(1-upPercent)},
			{name:'涨跌中位数', value:median},
			{name:'涨跌平均数', value:mean},
		];
		let dataArr2 = [
			{name:'上涨平均值', value:up.mean},
			{name:'上涨中位数', value:up.median},
			{name:'下跌平均值', value:down.mean},
			{name:'下跌中位数', value:down.median},
		];

		let row1 = (<div className="row large">
									{dataArr1.map((data) => {
										return that.getNodeCells(data.name, data.value, decimal, null, 0);
									})}
							</div>);

		let row2 = (<div className="row small">
									{dataArr2.map((data) => {
										return that.getNodeCells(data.name, data.value, decimal, null, 1);
									})}
							</div>);
		return [row1, row2];
	}

	getNodeCells(name, value, decimal, unit, rowIndex) {
		value = value * 100;
		decimal = decimal || 2;
		if(name=='上涨比例' || name=='下跌比例') {
			decimal = 1;
		}
		unit = unit || '%';
		let valueString = value.toFixed(decimal) + '';
		let values = valueString.split('.');
		if(rowIndex === 1) {
			return <div className="ks-col-25">
						<p><span className="name">{name}</span><span className="percent-info"><span>{values[0]}</span><span>.</span><span>{values.length>1 ? values[1] : ''}</span><span>{unit}</span></span></p>
					</div>;
		}
		let color = 'red';
		return <div className="ks-col-25">
						<p className="percent-info red"><span>{values[0]}</span><span>.</span><span>{values.length>1 ? values[1] : ''}</span><span>{unit}</span></p>
						<p><span className="circle red"></span>{name}</p>
					</div>;
	}
	//弃用
	generateCells() {
		const decimal = getDecimalForStatistic();
		let data = this.getStatisticsData();
		let { median, mean, upPercent, up, down } = data;
		let that = this;
		let dataArr = [];
			dataArr = [
									{name:'上涨比例', value:upPercent},
									{name:'下跌比例', value:(1-upPercent)},
									{name:'涨跌中位数', value:median},
									{name:'涨跌平均数', value:mean},
									// {name:'上涨收益平均数', value:up.mean},
									// {name:'下跌收益平均数', value:down.mean},
								];
		let nodes = dataArr.map(({name, value}) => {
									return that.generateDataCell(name, value*100, decimal);
								});
		return nodes;
	}
	//弃用
	generateDataCell(title, data, decimal, unit) {
		decimal = decimal || 2;
		if(title=='上涨比例' || title=='下跌比例') {
			decimal = 1;
		}
		unit = unit || '%';
		return <span className='statistic-data-cell'>
			<div className='cell-title font-simsun'>{title}</div>
			<div className='cell-data font-fangzhengcuhei'><span className='value'>{data.toFixed(decimal)}</span><span className='unit'>{unit}</span></div>
		</span>;
	}

}

ReportDetailView.propTypes = propTypes;
ReportDetailView.defaultProps = defaultProps;

export default ReportDetailView;