import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
// import ComparatorHeatmap from '../components/ComparatorHeatmap';
import layoutActions from '../flux/actions/layoutActions';
import BlockHeatMap from '../ksControllers/BlockHeatMap';
import {getDecimalForStatistic} from '../shared/storeHelper';

const propTypes = {

};

const defaultProps = {

};

class HeatmapContainer extends React.Component {

	constructor(props) {
		super(props);
		this.state = {};
    this._heatMapChart = null;
    let that = this;
    this._handleResize = () => {
      that._heatMapChart && that._heatMapChart.resize();
    };
	}

	componentDidMount() {
    window.addEventListener('resize', this._handleResize);
	}

	componentWillReceiveProps(){

	}

	shouldComponentUpdate(){
		return true;
	}

  componentDidUpdate() {
    this.updateHeatMap();
  }

	componentWillUnmount(){
    window.removeEventListener('resize', this._handleResize);
	}

  updateHeatMap(){
    this._heatMapChart = this._heatMapChart || new BlockHeatMap(this.refs.heatmap_container);
    window._blockHeatMapChart = this._heatMapChart;

    let _predictionChart = window._predictionChart;
    if(_predictionChart) {
      let {yMin, yMax} = _predictionChart.getLineChartMinMax();
      let labelDecimal = getDecimalForStatistic();
      this._heatMapChart.setData(_predictionChart.getLastPrices(), yMin, yMax, {labelDecimal});
    } 
  }

  togglePredictionPanel() {
    this.props.dispatch(layoutActions.togglePredictionPanel());
  }

  // _doWhenSeries0Completed(callback) {
  //   function run() {
  //     let chart = document[window.document.getElementsByTagName('iframe')[0].id];
  //     chart.Q5.getAll()[0].model().mainSeries().onCompleted().unsubscribe(null, run);
  //     callback()
  //   };

  //   let chart = document[window.document.getElementsByTagName('iframe')[0].id];
  //   chart.Q5.getAll()[0].model().mainSeries().onCompleted().subscribe(null, run);
  // }

	render(){
    const {stretchView, heatmapYAxis, patterns, scaleMinValue, scaleMaxValue, manulScale, filter} = this.props;
		return (
      <div className={'prediction-panel'}>
        <div className='comparator-heatmap' ref='heatmap_container'></div>
        {/*<ComparatorHeatmap
          stretchView={ stretchView }
          heatmapYAxis={ heatmapYAxis }
          patterns={ patterns }
          scaleMinValue={ scaleMinValue }
          scaleMaxValue={ scaleMaxValue }
          manulScale={manulScale}
          filter={filter} />*/}
      </div>
  );
	}
}

HeatmapContainer.propTypes = propTypes;
HeatmapContainer.defaultProps = defaultProps;

let stateToProps = function(state) {
  const {layout, patterns, prediction, filter} = state;
  const {stockView, isPredictionShow} = layout;
  const {heatmapYAxis, scaleMaxValue, scaleMinValue, manulScale} = prediction;

	return {
    stretchView: !stockView,
    isPredictionShow: isPredictionShow,
    heatmapYAxis: heatmapYAxis,
    scaleMinValue: scaleMinValue,
    scaleMaxValue: scaleMaxValue,
    patterns: patterns,
    filter,
    manulScale,
  };
};

export default connect(stateToProps)(HeatmapContainer);
