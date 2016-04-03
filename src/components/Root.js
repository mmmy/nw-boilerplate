import React from 'react';

class Root extends React.Component {
	constructor(props) {
		super(props);
		console.log(props,'aaa');
		//window.alert('aa');
	}

	handleClick(){
		alert('clicked-0-');
	}

	render(){
		return <div><h2 onClick={this.handleClick}>Root</h2><button onClick={this.handleClick}>click</button></div>;
	}
}

export default Root;