import React, { PropTypes } from 'react';
import classNames from 'classnames';
import statisticKline from './utils/statisticKline';

const propTypes = {
	crossFilter: PropTypes.object.isRequired,
	//report: PropTypes.object.isRequired,
	fullView: PropTypes.bool,
};

const defaultProps = {
  	fullView: true
};

class ReportDetailView extends React.Component {

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

		if(!$.fn.animatedCss){
			$.fn.extend({
			    animateCss: function (animationName) {
			        var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
			        $(this).addClass('animated ' + animationName).one(animationEnd, function() {
			            $(this).removeClass('animated ' + animationName);
			        });
			    }
			});
		}

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
					return (<div className='item-body' key={i}>
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

		let data = this.getStatisticsData();
		let { median, mean, upPercent, up, down } = data;

		let className = classNames('reportdetail-container');
		
		let upClass = classNames('report-item', 'result-item-righttop', {
			'ks-hidden': !fullView,
			//'transition-delay0': !fullView,
			'ks-fade-in': fullView,
			'ks-show': fullView
		});
		
		let downClass = classNames('report-item', 'result-item-rightbottom', {
			'ks-hidden': !fullView,
			//'transition-delay0': !fullView,
			'ks-fade-in': fullView,
			'ks-show': fullView
		});


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

			{ this.renderStuffs(data) }

			<div className={upClass}>

				{this.generateItem({
					title:'上涨', 
					items:[
							{name:'收益中位数', content:(up.median*100).toFixed(2)+'%'}, 
							{name:'收益平均数',content:(up.mean*100).toFixed(2)+'%'}, 
							{name:'上涨极值',content:(up.max*100).toFixed(2)+'%'}
						]
					})
				}

			</div>

			<div className={downClass}>

				{this.generateItem({
					title:'下跌', 
					items:[
							{name:'收益中位数', content:down.median.toFixed(2)+'%'}, 
							{name:'收益平均数',content:(down.mean*100).toFixed(2)+'%'}, 
							{name:'上涨极值',content:(down.min*100).toFixed(2)+'%'}
						]
					})
				}

			</div>

		</div>);
	}

	renderStuffs(data) {
		
		const { fullView } = this.props;
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
			<div className={daysClass}>统计天数</div>,
			<div className={daysValueClass}>30</div>,
			<div className={shouyiClass}>收益</div>,
			<div className={upRateClass}>上涨比例</div>, //xiaolu
			<div className={upRateValueClass} style={{'color': '#b61c15'}}>{ (data.upPercent*100).toFixed(1) + '%' }</div>,
			<div className={medianClass}>中位数</div>,
			<div className={medianValueClass}>{ (data.median*100).toFixed(2) + '%' }</div>,
			<div className={meanClass}>平均值</div>,
			<div className={meanValueClass}>{ (data.mean*100).toFixed(2) + '%' }</div>,
		];
	}
}

ReportDetailView.propTypes = propTypes;
ReportDetailView.defaultProps = defaultProps;

export default ReportDetailView;