import React, {PropTypes} from 'react';
import MainContainer from './MainContainer';
//import { connect } from 'react-redux';
import { toggleStockView } from '../flux/actions/layoutActions';
import Header from './Header';
import RightToolBar from './RightToolBar';
import CoreApp from './CoreApp';

import StockView from './StockView';
import SearchReport from './SearchReport';

class Root extends React.Component {
	
	constructor(props) {
		super(props);
	}

	render(){

		const { stockView } = this.props;

		return <MainContainer>

			<Header />

			<RightToolBar />

			<CoreApp />

		</MainContainer>;
	}

}

export default Root;
