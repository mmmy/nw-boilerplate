import React from 'react';
import { connect } from 'react-redux';
import StockView from './StockView';
import SearchReport from './SearchReport';

class MainChart extends React.Component {
	constructor(props) {
		super(props);
	}

	componentDidMount() {

	}

	render() {
		return (
      <div className='container-coreapp'>
        <StockView />
        <SearchReport />
      </div>
    );
	}

}
function stateToPorps(state){
	return {};
}
export default connect(stateToPorps)(MainChart);
