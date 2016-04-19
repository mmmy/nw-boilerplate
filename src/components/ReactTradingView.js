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
      setChartLayout();
      console.log(getComparatorSize());
    }
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
