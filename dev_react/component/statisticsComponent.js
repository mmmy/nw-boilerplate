import React from 'react';
import statisticsComponent from '../../src/ksControllers/statisticsComponent';

export default React.createClass({
	getInitailState() {
		return {};
	},
	componentDidMount() {
		statisticsComponent.init(this.refs.container);
	},
	render(){

		return (<div ref="container" style={{position:'relative',height:'500px',border:'1px solid rgba(0,0,0,0.2)'}}>
		</div>);
	}

});