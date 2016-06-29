import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import ComparatorHeatmap from '../components/ComparatorHeatmap';
import layoutActions from '../flux/actions/layoutActions';

const propTypes = {

};

const defaultProps = {

};

class HeatmapContainer extends React.Component {

	constructor(props) {
		super(props);
		this.state = {};
	}

	componentDidMount() {

	}

	componentWillReceiveProps(){

	}

	shouldComponentUpdate(){
		return true;
	}

	componentWillUnmount(){

	}


  togglePredictionPanel() {
    this.props.dispatch(layoutActions.togglePredictionPanel());

    if (this.props.isPredictionShow === false) {
      // window.widget_comparator.setVisibleRange(window.searchingRange, '0');
      window.widget_comparator._innerWindow().Q5.getAll()[0].model().mainSeries().restart();
      this._doWhenSeries0Completed(() => {
        window.widget_comparator.setVisibleRange(window.searchingRange, '0');
      });
      // window.widget_comparator.scrollToOffsetAnimated(window.ksMainChartRightOffset, 200);
    }
  }

  _doWhenSeries0Completed(callback) {
    function run() {
      let chart = document[window.document.getElementsByTagName('iframe')[0].id];
      chart.Q5.getAll()[0].model().mainSeries().onCompleted().unsubscribe(null, run);
      callback()
    };

    let chart = document[window.document.getElementsByTagName('iframe')[0].id];
    chart.Q5.getAll()[0].model().mainSeries().onCompleted().subscribe(null, run);
  }

	render(){
    const {stretchView, heatmapYAxis, patterns, scaleMinValue, scaleMaxValue} = this.props;
		return (
      <div className={'prediction-panel'}>
        <button
          className={ 'prediction-toggle' }
          onClick={ this.togglePredictionPanel.bind(this) }>
          <i className={this.props.isPredictionShow ? "fa fa-caret-right" : "fa fa-caret-left"}></i>
        </button>
        <ComparatorHeatmap
          stretchView={ stretchView }
          heatmapYAxis={ heatmapYAxis }
          patterns={ patterns }
          scaleMinValue={ scaleMinValue }
          scaleMaxValue={ scaleMaxValue } />
      </div>
  );
	}
}

HeatmapContainer.propTypes = propTypes;
HeatmapContainer.defaultProps = defaultProps;

let stateToProps = function(state) {
  const {layout, patterns, prediction} = state;
  const {stockView, isPredictionShow} = layout;
  const {heatmapYAxis, scaleMaxValue, scaleMinValue} = prediction;

	return {
    stretchView: !stockView,
    isPredictionShow: isPredictionShow,
    heatmapYAxis: heatmapYAxis,
    scaleMinValue: scaleMinValue,
    scaleMaxValue: scaleMaxValue,
    patterns: patterns,
  };
};

export default connect(stateToProps)(HeatmapContainer);
