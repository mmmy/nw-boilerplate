import React from 'react';
import MainContainer from './MainContainer';
//import { connect } from 'react-redux';
//import { toggleStockView } from '../flux/actions/layoutActions';
import Header from './Header';
import RightToolBar from './RightToolBar';
import SearchConfigModal from './SearchConfigModal';
import CoreApp from './CoreApp';
import waitingWidget from '../shared/waitingWidget';

//import StockView from './StockView';
//import SearchReport from './SearchReport';

class Root extends React.Component {
	
	constructor(props) {
		super(props);
	}

	componentDidMount() {
		console.log('rooot did mount');
		setTimeout(waitingWidget.removeWaiting, 500);
		require('../shared/initDev')();
	}

	render(){

		return (
				<MainContainer>
					<div className='fix-drag-bug'></div>
					<Header />

					<RightToolBar />

					<CoreApp />

					<SearchConfigModal />

				</MainContainer>
		);
	}

}

export default Root;
