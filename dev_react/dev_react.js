import React from 'react';
//require('../src/styles/main.less');
window.$ = require('jquery');

let tabsArr = [
	{title:'chart',component:'./component/chart'},
	{title:'chart',component:'./component/transition'},
	];



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