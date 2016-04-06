import React, {PropTypes} from 'react';
import MainContainer from './main-container/MainContainer';
import { connect } from 'react-redux'
import { toggleStockView } from '../flux/actions/layoutActions';
import Header from './header/Header';
import RightToolBar from './right-tool-bar/RightToolBar';
import CoreApp from './core-app/CoreApp';

import StockView from './stock-view/StockView';
import SearchReport from './search-report/SearchReport';

const propTypes = {
	dispatch: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
	const { layout } = state;
	const { stockView } = layout;
	return {
	  stockView
	};
}

// function mapDispatchProps(dispatch) {
//   return {
//     toggleView: function(toggleStockView){ dispatch({type:"TOGGLE_STOCK_VIEW", toggleStockView:toggleStockView}); },
//   };
// }

class Root extends React.Component {
	
	constructor(props) {
		super(props);
	}

	render(){
		const { stockView } = this.props;
		return <MainContainer>

			<Header />

			<RightToolBar />

			<CoreApp>
				<StockView show={stockView}/>
				<div><button className="btn btn-default" onClick={this.toggleView.bind(this)}>云搜索</button></div>
				<SearchReport fullView={!stockView}/>
			</CoreApp>

		</MainContainer>;
	}

	toggleView(){
		const { dispatch } = this.props;
		dispatch(toggleStockView());
	}
}

Root.propTypes = propTypes;

export default connect(mapStateToProps)(Root);