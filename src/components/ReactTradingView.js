import React, { PropTypes } from 'react';

const propTypes = {
	viewId: PropTypes.string.isRequired,
	options: PropTypes.object.isRequired,
  init: PropTypes.bool,
};

const defaultProps = {
  init: false
};

class ReactTradingView extends React.Component {
	constructor(props) {
		super(props);
    this._inited = false;
	}

  componentDidMount() {
    // let getParameterByName = (name) => {
    //   name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    //   var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    //   results = regex.exec(location.search);
    //   return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    // }
    setTimeout(this.tryInitTradingView.bind(this), 800);
  }

  componentDidUpdate() {
    setTimeout(this.tryInitTradingView.bind(this), 800);
    // this.tryInitTradingView();
  }

  tryInitTradingView() {
    if (this._inited) return;
    let {init} = this.props;
    if (init) {
      let options = window.$.extend(this.props.options, {container_id: this.props.viewId});
      if (process.env.yq == 'yes') return;

      let widget = new window.TradingView.widget(options);

      if (this.props.viewId === 'comparator-chart') window.widget_comparator = widget;

      if (this.props.viewId === 'comparator-chart') {
        this.setChartLayout();
      }
      this._inited = true;
    }
  }

  getChartDom() {
    return window.widget_comparator;
  }

  setChartLayout() {
    setTimeout(() => {
      let chart = this.getChartDom();
      if ( chart && chart.W76 && chart.Q5 && chart.Q15.studyCounter > 0) {
        chart.W76.setChartLayout(chart.Q5, 'ks');
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
