import React from 'react';
import CountLinesChart from '../../src/ksControllers/CountLinesChart';
import LinesChart from '../../src/ksControllers/scannerController/LinesChart';
import Switch from '../../src/ksControllers/widget/KsSwitch';

export default React.createClass({
	getInitailState() {
		return {};
	},
	componentDidMount() {
		this.drawChart();
		this.drawSwitch();
		this.drawLinesChart();
	},
	drawSwitch() {
		var options = {
			dom: this.refs.switch_wrapper,
		};
		var ksSwitch = new Switch(options);
	},
	drawChart() {
		var chart = new CountLinesChart(this.refs.container);
		chart.render();
	},
	drawLinesChart() {
		var chart = new LinesChart(this.refs.lines_chart);
		chart.test();
	},

	render(){

		return (<div style={{overflow:'hidden'}}>
			<div ref="container" style={{position:'relative',width:'330px',height:'230px',border:'1px solid rgba(0,0,0,0.2)'}}></div>
			<div ref="switch_wrapper"></div>
			<div ref="lines_chart" style={{position:'relative',width:'500px',height:'300px'}}></div>
		</div>);
	}

});