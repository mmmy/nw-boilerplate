import React from 'react';
//require('../src/styles/main.less');
window.$ = require('jquery');
require('../src/shared/extendJquery')(window.$);
window.$.DEBUG = true;

let tabsArr = [
	// {title:'waves',component:'./component/waves'},
	// {title:'kPrediction',component:'./component/kPrediction'},
	// {title:'searchresult',component:'./component/searchresult'},
	// {title:'watchList',component:'./component/watchList'},
	{title:'lineAreaChart',component:'./component/lineAreaChart'},
	{title:'scanner',component:'./component/scanner'},
	{title:'ksprediction',component:'./component/ksprediction'},
	{title:'statisticsComponent',component:'./component/statisticsComponent'},
	// {title:'prediction',component:'./component/prediction'},
	// {title:'heatmap',component:'./component/heatmap'},
	// {title:'chart',component:'./component/chart'},
	// {title:'transition',component:'./component/transition'},
	// {title:'config',component:'./component/configModal'},
	];

require('../tradingview/charting_library/datafeed/udf/ks_symbols_database');
require('../tradingview/charting_library/datafeed/udf/mock_request');
require('../tradingview/charting_library/datafeed/udf/kfeed');

let Main = React.createClass({
	getInitialState(){
		let data = this.props.data;
		let index = 0;
		let Current = (typeof data[index].component == 'string') ? require(data[index].component) : data[index].component;
		return {current:(<Current /> || (<h3>请选择</h3>)),index:index};
	},
	handleSelectComponent(index){
		//require.ensure([], () => {
			let data = this.props.data;
			let Current = (typeof data[index].component == 'string') ? require(data[index].component) : data[index].component;
			this.setState({index:index,current:<Current />});
		//});
	},

	render(){
		let data = this.props.data;
		let tabNodes = [];
		let that = this;
		tabNodes = data.map(function(e,i){
			return <span className={'tab'+(that.state.index==i?' selected':'')} onClick={that.handleSelectComponent.bind(that,i)}>{e.title}</span>;
		});
		//let DataGrid = require(data[this.state.index].component);
		return <div className='main'>
			<div>
				{tabNodes}
			</div>
			<hr/>
			{this.state.current}
		</div>;
	}
});



React.render(<Main data={tabsArr}/>, document.getElementById('app'));

// React.render(<div><h1>webpack</h1><KSModal showModal={true}><p>aaa</p></KSModal></div>, document.getElementById('app'));