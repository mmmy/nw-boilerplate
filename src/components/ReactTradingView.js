import React, { PropTypes } from 'react';
import { setChartLayout, getComparatorSize } from '../flux/util/tradingViewWidget';

const propTypes = {
	viewId: PropTypes.string.isRequired,
	options: PropTypes.object.isRequired,
};

const defaultProps = {

};

class ReactTradingView extends React.Component {
	constructor(props) {
		super(props);

	}

  componentDidMount() {
    console.log('componentDidMountm');
    // let getParameterByName = (name) => {
    //   name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    //   var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    //   results = regex.exec(location.search);
    //   return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    // };

    let options = window.$.extend(this.props.options, {container_id: this.props.viewId});
    if (process.env.yq == 'yes') return;

    let widget = new window.TradingView.widget(options);

    if (this.props.viewId === 'comparator-chart') {
      this.setChartLayout();
    }
  }

  getChartDom() {
    return document[window.document.getElementsByTagName('iframe')[0].id];
  }

  setChartLayout() {
    setTimeout(() => {
      let chart = this.getChartDom();
      if ( chart && chart.W76 && chart.Q5 && chart.Q15.studyCounter > 0) {
        chart.W76.setChartLayout(chart.Q5, '2v');
      } else {
        this.setChartLayout();
      }
    }, 0)
  }

	render(){
		return (
    <div className={ "chart-container" } ref={ this.props.viewId } id={ this.props.viewId } />
    )
	}
}

ReactTradingView.propTypes = propTypes;
ReactTradingView.defaultProps = defaultProps;
export default ReactTradingView;
