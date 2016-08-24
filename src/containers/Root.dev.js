import React from 'react';
import MainContainer from './MainContainer';
//import { connect } from 'react-redux';
// import { toggleStockView } from '../flux/actions/layoutActions';
import Header from './Header';
import RightToolBar from './RightToolBar';
import CoreApp from './CoreApp';
import TitleBar from './TitleBar';
import SearchConfigModal from './SearchConfigModal';
import DevTools from './DevTools';

// import StockView from './StockView';
// import SearchReport from './SearchReport';

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

		      <DevTools />

				</MainContainer>
			</div>
			);
	}

}

export default Root;
