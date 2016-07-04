import React, { PropTypes } from 'react';
import classNames from 'classnames';
import {connect} from 'react-redux';
import path from 'path';
import ComparatorPrediction from '../components/ComparatorPrediction';

const propTypes = {
	stretchView: PropTypes.bool
};

const defaultProps = {

};

class Comparator extends React.Component {

	constructor(props) {
		super(props);
		this.defaultProps = {

		};
		this.state = {
    };
	}

	componentDidMount() {
	}

	componentWillReceiveProps(){

	}

  componentDidUpdate() {
  	let { stretchView } = this.props;
  	if(!stretchView) {
  		//$(this.refs.img1).animateCss('slideInLeft');
  		//$(this.refs.img2).animateCss('slideInLeft');
  	}
  }

	shouldComponentUpdate(){
		return true;
	}

	componentWillUnmount(){

	}


	render() {
		let { stretchView, screenshotTvURL, screenshotEChartURL, screenshotHeatmapURL, searchingError } = this.props;
    const containerClassName = classNames('transition-all', 'container-comparator', {
      'container-comparator-stretch': this.props.stretchView,
    });
      const screenshotTvClassName = classNames('comparator-tv-screenshot transition-all', {
      	'stretch': stretchView
      });
      const screenshotEchartClassName = classNames('comparator-echart-screenshot transition-all', {
      	'stretch':stretchView
      });
      const screenshotHeatmapClassName = classNames('comparator-heatmap-screenshot transition-all', {
      	'stretch':stretchView
      });

      const searchingInfoClassNames = classNames('searching-info', {
        'ks-hidden': searchingError
      })

		return (
      <div className={ containerClassName } >
        {/*setting searching info from TradingView*/}
        <div className={ searchingInfoClassNames }><span id={'searching-info-content'}></span><span className={'searching-info--prediction-lable'}>走势预测</span></div>

        { screenshotTvURL ? <img ref='img1' key={ screenshotTvURL } src={ screenshotTvURL } className={ screenshotTvClassName }/> : '' }
        { screenshotEChartURL ? <img ref='img2' key={ screenshotEChartURL } src={ screenshotEChartURL } className={ screenshotEchartClassName }/> : '' }
        { screenshotHeatmapURL ? <img ref='img3' key={ screenshotHeatmapURL } src={ screenshotHeatmapURL } className={ screenshotHeatmapClassName }/> : '' }
      </div>
    );
	}
}

Comparator.propTypes = propTypes;
Comparator.defaultProps = defaultProps;

let stateToProps = function(state) {
	const { layout, patterns } = state;
	const { stockView, hasNewScreenshot, screenshotTvURL, screenshotEChartURL, screenshotHeatmapURL } = layout;
  const { error } = patterns;
	return {
		stretchView: !stockView,
    hasNewScreenshot: hasNewScreenshot,
    screenshotTvURL: screenshotTvURL,
    screenshotEChartURL: screenshotEChartURL,
    screenshotHeatmapURL: screenshotHeatmapURL,
    searchingError: error
	};
};
export default connect(stateToProps)(Comparator);
