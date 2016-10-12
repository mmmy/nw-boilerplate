import React from 'react';
import MainContainer from './MainContainer';
//import { connect } from 'react-redux';
// import { toggleStockView } from '../flux/actions/layoutActions';
import Header from './Header';
import RightToolBar from './RightToolBar';
import CoreApp from './CoreApp';
import SearchConfigModal from './SearchConfigModal';
import DevTools from './DevTools';
import waitingWidget from '../shared/waitingWidget';

// import StockView from './StockView';
// import SearchReport from './SearchReport';

class Root extends React.Component {

	constructor(props) {
		super(props);
	}

	componentDidMount() {
		console.log('rooot did mount');
		// require('../shared/initDev')();
		setTimeout(waitingWidget.removeWaiting, 500);
		//init tooltip
		require('../shared/initTooltip');
		//require('../shared/heapA');
	}

	render(){

		return (
				<MainContainer>
					<div className='fix-drag-bug'></div>
					<Header />

					<RightToolBar />

					<CoreApp />

					<SearchConfigModal />

		      <DevTools />

				</MainContainer>
			);
	}

}

export default Root;
