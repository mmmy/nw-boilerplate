import React from 'react';
import CountLinesChart from '../../src/ksControllers/CountLinesChart';
import Switch from '../../src/ksControllers/widget/KsSwitch';

export default React.createClass({
	getInitailState() {
		return {};
	},
	componentDidMount() {
		this.drawChart();
		this.drawSwitch();
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
	render(){

		return (<div style={{overflow:'hidden'}}>
			<div ref="container" style={{position:'absolute',width:'330px',height:'230px',border:'1px solid rgba(0,0,0,0.2)'}}></div>
			<div ref="switch_wrapper"></div>
		</div>);
	}

});