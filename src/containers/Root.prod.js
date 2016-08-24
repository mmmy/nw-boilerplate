import React from 'react';
import MainContainer from './MainContainer';
//import { connect } from 'react-redux';
//import { toggleStockView } from '../flux/actions/layoutActions';
import Header from './Header';
import RightToolBar from './RightToolBar';
import SearchConfigModal from './SearchConfigModal';
import CoreApp from './CoreApp';
import TitleBar from './TitleBar';

//import StockView from './StockView';
//import SearchReport from './SearchReport';

class Root extends React.Component {
	
	constructor(props) {
		super(props);
	}

	render(){

		return (
			<div className='app-wrapper'>
				
				<TitleBar />

				<MainContainer>

					<Header />

					<RightToolBar />

					<CoreApp />

					<SearchConfigModal />

				</MainContainer>
			</div>
		);
	}

}

export default Root;
