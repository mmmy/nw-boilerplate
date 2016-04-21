import React from 'react';

export default React.createClass({
	
	getInitialState(){
		return {larger: false};
	},

	render(){

		return (<div style={{position:'relative'}}>
			<button className='btn btn-default btn-sm' onClick={this.handleClick}>transition</button>
			<div className='transition-all' style={{height:(this.state.larger ? '500px' : '200px'), border:'2px solid #999', margin:'20px', top:(this.state.larger ? '0' : '300px'), position:'absolute', width:'400px' }}></div>
			</div>);
	},

	handleClick(){
		var larger = !this.state.larger;
		this.setState({larger});
	}
});