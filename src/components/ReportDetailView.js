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
		this.state = {showSelect: false, type:TYPES[0]};
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

		let iconClassName = classNames('icon', {up: this.state.showSelect});

		return (<div className={className}>

			{/*<div className='report-item result-item-1'>

				{this.generateItem({
										title:'统计天数', 
										items:[
												{name:'样本数',content:sampleSize}, 
												{name:'上涨概率', content:(riseProbability*100).toFixed(1)+'%', redColor:riseProbability > 0.5}, 
											]
									})
				}

			</div>*/}

			{/*<div className='report-item result-item0'>

				{this.generateItem({
										title:'搜索结果', 
										items:[
												{name:'样本数',content:sampleSize}, 
												{name:'上涨概率', content:(riseProbability*100).toFixed(1)+'%', redColor:riseProbability > 0.5}, 
											]
									})
				}

			</div>*/}

			{/*<div className='report-item result-item1'>

				{this.generateItem({
									title:'收益率', 
									items:[
										{name:'平均数',content:earningAverage}, 
										{name:'中位数',content:median}] 
									})
				}

			</div>*/}
			<div className='header-container' tabIndex='0' ref='header_container'>
				<span className={titleClassName}>历史指标统计</span>
				<span className='select-container'>
					<button ref='select_btn' className='statistic-type-select font-simsun' onMouseDown={this.handleTypeMouseDown.bind(this)} onFocus={this.handleTypeButtonFocus.bind(this)} onBlur={this.handleTypeButtonBlur.bind(this)}>
						<span className='label-value'>{this.state.type}</span>
						<span className={iconClassName}></span>
						{this.state.showSelect ? 
							<div className='select-dropdown'>
								{TYPES.map((type,i)=>{
									return <div className='option' onMouseDown={stopPropagationHelper} onClick={this.handleTypeChange.bind(this)}>{type}</div>
								})}
							</div> 
							: 
							''
						}
					</button>
				</span>
			</div>
			{fullView ? '' : [<span className='split-line l1'></span>, <span className='split-line l2'></span>, <span className='split-line l3'></span>]}
			<div className='statistic-data-container'>
				<div className='statistic-data-container-inner'>
					{this.generateCells()}
				</div>
			</div>
		</div>);
	}

	handleTypeChange(e) {
		e.stopPropagation();
		let type = e.target.innerHTML;
		this.setState({type:type});
		this.refs.header_container.focus();
	}

	handleTypeMouseDown(e) {
		if(this.state.showSelect){
			e.preventDefault();
			e.stopPropagation();
			this.refs.select_btn.blur();
			// this.setState({showSelect:false});
		}
	}

	handleTypeButtonFocus() {
		this.setState({showSelect:true});
	}

	handleTypeButtonBlur() {
		this.setState({showSelect:false});
	}

	generateCells() {
		const decimal = getDecimalForStatistic();
		let data = this.getStatisticsData();
		let { median, mean, upPercent, up, down } = data;
		let that = this;
		let dataArr = [];
		if(this.state.type == TYPES[0]) {
			dataArr = [
									{name:'上涨比例', value:upPercent},
									{name:'下跌比例', value:(1-upPercent)},
									{name:'涨跌中位数', value:median},
									{name:'涨跌平均数', value:mean},
									// {name:'上涨收益平均数', value:up.mean},
									// {name:'下跌收益平均数', value:down.mean},
								];
		} else if(this.state.type == TYPES[1]) {
			dataArr = [
									{name:'上涨极值', value:up.max},
									{name:'上涨中位数', value:up.median},
									{name:'上涨平均数', value:up.mean}
								];
		} else if(this.state.type == TYPES[2]) {
			dataArr = [
									{name:'下跌极值', value:down.min},
									{name:'下跌中位数', value:down.median},
									{name:'下跌平均数', value:down.mean}
								];
		}
		let nodes = dataArr.map(({name, value}) => {
									return that.generateDataCell(name, value*100, decimal);
								});
		return nodes;
	}

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

	renderStuffs(data) {
		const decaimal = getDecimalForStatistic();
		const { fullView, searchConfig } = this.props;
		let daysStr = searchConfig && searchConfig.additionDate && searchConfig.additionDate.value || '0';
		//统计天数
		const daysClass = classNames('position-ab', 'text-center', 'transition-all', 'days', {'mama': !fullView});
		//统计天数值
		const daysValueClass = classNames('position-ab', 'text-center', 'transition-all', 'days-value', 'font-number', {'mama': !fullView});
		//收益
		const shouyiClass = classNames('position-ab', 'text-center', 'title-bala', 'shouyi', { 'ks-hidden': !fullView, 'ks-fade-in': fullView, 'ks-show': fullView });
		//上涨比例
		const upRateClass = classNames('position-ab', 'text-center', 'transition-all', 'up-rate', {'mama': !fullView});
		//上涨比例值
		const upRateValueClass = classNames('__fadeIn', 'position-ab', 'text-center', 'transition-all', 'up-rate-value', 'font-number', {'mama': !fullView});
		//中位数
		const medianClass = classNames('position-ab', 'text-center', 'transition-all', 'median', {'mama': !fullView});
		//中位数值
		const medianValueClass = classNames('__fadeIn', 'position-ab', 'text-center', 'transition-all', 'median-value', 'font-number', {'mama': !fullView});
		//平均数
		const meanClass = classNames('position-ab', 'text-center', 'transition-all', 'mean', {'mama': !fullView});
		//平均数值
		const meanValueClass = classNames('__fadeIn', 'position-ab', 'text-center', 'transition-all', 'mean-value', 'font-number', {'mama': !fullView });

		return [
			<div className={daysClass}>统计K线数</div>,
			<div className={daysValueClass}>{daysStr}</div>,
			<div className={shouyiClass}>收益</div>,
			<div className={upRateClass}>上涨比例</div>, //xiaolu
			<div className={upRateValueClass} >{ (data.upPercent*100).toFixed(1) }{'%'}</div>,
			<div className={medianClass}>{fullView?'':'收益'}中位数</div>,
			<div className={medianValueClass}>{ (data.median*100).toFixed(decaimal)}{'%'}</div>,
			<div className={meanClass}>{fullView?'':'收益'}平均值</div>,
			<div className={meanValueClass}>{ (data.mean*100).toFixed(decaimal)}{'%'}</div>,
		];
	}
}

ReportDetailView.propTypes = propTypes;
ReportDetailView.defaultProps = defaultProps;

export default ReportDetailView;