import React from 'react';
import MainContainer from './main-container/MainContainer';
import { connect } from 'react-redux'

import Header from './header/Header';
import RightToolBar from './right-tool-bar/RightToolBar';
import CoreApp from './core-app/CoreApp';

import StockView from './stock-view/StockView';
import SearchReport from './search-report/SearchReport';

function mapStateToProps(state) {
  return {
    toggleStockView: state.toggleStockView
  };
}

function mapDispatchProps(dispatch) {
  return {
    toggleView: function(toggleStockView){ dispatch({type:"TOGGLE_STOCK_VIEW", toggleStockView:toggleStockView}); },
  };
}

class Root extends React.Component {
	
	constructor(props) {
		super(props);
		this.state = {viewStock:true};
	}

	render(){
		const { toggleStockView,  toggleView} = this.props;
		return <MainContainer>

			<Header />

			<RightToolBar />

			<CoreApp>
				<StockView show={toggleStockView}/>
				<div><button className="btn btn-default" onClick={toggleView.bind(this, !toggleStockView)}>云搜索</button></div>
				<SearchReport fullView={!toggleStockView}/>
			</CoreApp>

		</MainContainer>;
	}

	toggleView(){
		//this.setState({viewStock: !this.state.viewStock});
		//let toggleStockView = !this.props.store.getState().toggleStockView;
		//this.props.store.dispatch({type:"TOGGLE_STOCK_VIEW", toggleStockView});
	}
}

export default connect(mapStateToProps, mapDispatchProps)(Root);