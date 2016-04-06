import React from 'react';
import { connect } from 'react-redux';
import StockView from './StockView';
import SearchReport from './SearchReport';
import { layoutActions } from '../flux/actions';

class MainChart extends React.Component {
	constructor(props) {
		super(props);
	}

	componentDidMount(){
		
	}

	render(){
		return <div className='container-coreapp'>
				<StockView />
				<div><button className="btn btn-default" onClick={this.toggleView.bind(this)}>云搜索</button></div>
				<SearchReport />
		</div>;
	}

	toggleView(){
		this.props.dispatch(layoutActions.toggleStockView());
	}
}
function stateToPorps(state){
	return {};
}
export default connect(stateToPorps)(MainChart);
//export default MainChart;