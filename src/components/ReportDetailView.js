import React, { PropTypes } from 'react';
import classNames from 'classnames';

const propTypes = {
	report: PropTypes.object.isRequired,
};

const defaultProps = {
  
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

	generateItem({title, items}){
		return (<div className='item-container'>
			{ title ? <h5 className='item-title'>{title}</h5> : '' }
			<div className='flex-container body-container'>
				{items.map((e, i) => {
					let color = e.redColor === undefined ? '' : (e.redColor===true ? 'red':'green');
					return (<div className='item-body' key={i}>
							<div className='item-name'>{e.name}</div>
							<div className='item-data' style={{color:color}}>{e.content}</div>
						</div>);
				})}
			</div>
		</div>);
	}

	render(){
		const { report } = this.props;
		const { sampleSize, riseProbability, earningAverage, median, profitRiskRate, forecastCeilBound, forecastFloorBound } = report;
		console.log(report);
		let className = classNames('reportdetail-container');
		
		return (<div className={className}>
			<div className='report-item result-item0'>

				{this.generateItem({
										title:'搜索结果', 
										items:[
												{name:'样本数',content:sampleSize}, 
												{name:'上涨概率', content:(riseProbability*100).toFixed(1)+'%', redColor:riseProbability > 0.5}, 
											]
									})
				}

			</div>

			<div className='report-item result-item1'>

				{this.generateItem({
									title:'收益率', 
									items:[
										{name:'平均数',content:earningAverage}, 
										{name:'中位数',content:median}] 
									})
				}

			</div>

			<div className='report-item result-item2'>

				{this.generateItem({
					title:'收益 / 风险', 
					items:[
							{name:'收益风险比', content:profitRiskRate.toFixed(1)+'X'}, 
							{name:'预测上限',content:(forecastCeilBound*100).toFixed(2)+'%', redColor:forecastCeilBound>0}, 
							{name:'预测下限',content:(forecastFloorBound*100).toFixed(2)+'%', redColor:forecastFloorBound>0}
						]
					})
				}

			</div>
		</div>);
	}
}

ReportDetailView.propTypes = propTypes;
ReportDetailView.defaultProps = defaultProps;

export default ReportDetailView;