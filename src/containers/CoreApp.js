import React from 'react';
import { connect } from 'react-redux';
import StockView from './StockView';
import SearchReport from './SearchReport';
import ReactTradingView from '../components/ReactTradingView';
import classNames from 'classnames';

class MainChart extends React.Component {
	constructor(props) {
		super(props);
	}

	componentDidMount() {

	}

	render() {
    let comparatorChartClassName = classNames('comparator-chart-static', {
      'comparator-chart-static-show': this.props.stretchView,
      'comparator-chart-static-hide': !this.props.stretchView,
      'comparator-chart-static-transition-hidding': this.props.stretchView,
      'comparator-chart-static-transition-showing': !this.props.stretchView,
    });
    const STOCK_VIEW = 'comparator-chart';
    let options = {
      symbol: 'AA',
      interval: 'D',
      container_id: STOCK_VIEW,
      //	BEWARE: no trailing slash is expected in feed URL
      datafeed: new Datafeeds.UDFCompatibleDatafeed("http://demo_feed.tradingview.com"),
      library_path: "charting_library/",
      locale: "en",
      //	Regression Trend-related functionality is not implemented yet, so it's hidden for a while
      drawings_access: { type: 'black', tools: [ { name: "Regression Trend" } ] },
      disabled_features: ["use_localstorage_for_settings"],
      enabled_features: ["study_templates"],
      charts_storage_url: 'http://saveload.tradingview.com',
      charts_storage_api_version: "1.1",
      client_id: 'tradingview.com',
      user_id: 'public_user_id',
      autosize: true,
      fullscreen: false,
      // height: 300,
      // width: 300,
    }

		return (
      <div className='container-coreapp'>
        <div className={ comparatorChartClassName }>
          <ReactTradingView
            viewId={ STOCK_VIEW }
            options={ options } />
        </div>
        <StockView />
        <SearchReport />
      </div>
    );
	}

}
function stateToPorps(state) {
  const {layout} = state;
	const {stockView} = layout;
	return {
		stretchView: !stockView,
	};
}
export default connect(stateToPorps)(MainChart);
