import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import StockView from './StockView';
import SearchReport from './SearchReport';
import ComparatorStatic from './ComparatorStatic';
import classNames from 'classnames';
import { setRem } from '../components/utils/layoutUtils';

const propTypes = {
  stretchView: PropTypes.bool
};

class MainChart extends React.Component {
	constructor(props) {
		super(props);
	}

	componentDidMount() {
    setRem();
	}

  componentDidUpdate() {
    console.info('CoreApp did update in millsec: ', new Date() - this.d1);
  }

	render() {
    this.d1 = new Date();
    let comparatorChartClassName = classNames('comparator-chart-static', {
      'comparator-chart-static-show': this.props.stretchView,
      'comparator-chart-static-hide': !this.props.stretchView,
    });
    const STOCK_VIEW = 'comparator-chart';
    let options = {
      symbol: 'AA',
      interval: 'D',
      container_id: STOCK_VIEW,
      //	BEWARE: no trailing slash is expected in feed URL
      datafeed: new window.Datafeeds.UDFCompatibleDatafeed("http://demo_feed.tradingview.com"),
      library_path: "charting_library/",
      locale: "zh",
      //	Regression Trend-related functionality is not implemented yet, so it's hidden for a while
      drawings_access: { type: 'black', tools: [ { name: "Regression Trend" } ] },
      // disabled_features: ["use_localstorage_for_settings"],
      disabled_features: ["header_widget"],
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
        <ComparatorStatic />
        <StockView />
        <SearchReport />
      </div>
    );
	}

}

MainChart.propTypes = propTypes;

function stateToPorps(state) {
  const {layout} = state;
	const {stockView} = layout;
	return {
		stretchView: !stockView,
	};
}
export default connect(stateToPorps)(MainChart);
