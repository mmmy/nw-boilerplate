import React from 'react';
import CountLinesChart from '../../src/ksControllers/CountLinesChart';

export default React.createClass({
	getInitailState() {
		return {};
	},
	componentDidMount() {
		this.drawChart();
	},
	drawChart() {
		var chart = new CountLinesChart(this.refs.container);
		chart.render();
	},
	render(){

		return (<div ref="container" style={{position:'absolute',width:'330px',height:'230px',border:'1px solid rgba(0,0,0,0.2)'}}>
		</div>);
	}

});