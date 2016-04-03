import React from 'react';
import MainChart from './main_chart/MainChart';

class Root extends React.Component {
	constructor(props) {
		super(props);
	}

	handleClick(){
		alert('clicked--');
	}

	render(){
		return <MainChart />;
	}
}

export default Root;