import React from 'react';
import wavesController from '../../src/ksControllers/wavesController';

export default React.createClass({
	
	getInitialState(){
		return {};
	},

	componentDidMount() {
		wavesController.init(this.refs.wave_container);
		wavesController.start();
	},

	render(){

		return (<div style={{position:'absolute', width: '100%', height:'240px'}}>
				<div style={{position:'absolute', width:'100%', height:'100%'}} href="wave_container">
				</div>
			</div>);
	},

	handleClick(){
		
	}
});