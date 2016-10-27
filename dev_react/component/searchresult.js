import React from 'react';
import searchResultController from '../../src/ksControllers/searchResultController';

export default React.createClass({
	
	getInitialState(){
		return {larger: false};
	},

	initUI(){
		searchResultController.init(this.refs.root);
		searchResultController.updatePrediction();
	},
	
	componentDidMount() {
		this.initUI();
	},

	render(){

		return (<div style={{position:'absolute',width:'100%',height:'100%',bottom:'0'}} ref='root'>
			
		</div>);
	},

});