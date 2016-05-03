import React from 'react';
import SearchWaitingWaves from '../../src/components/SearchWaitingWaves';

export default React.createClass({
	
	getInitialState(){
		return {};
	},

	render(){

		return (<div style={{position:'absolute', width: '100%', height:'240px'}}>
				<div style={{position:'absolute', width:'100%', height:'100%'}}>
					<SearchWaitingWaves />
				</div>
			</div>);
	},

	handleClick(){
		
	}
});