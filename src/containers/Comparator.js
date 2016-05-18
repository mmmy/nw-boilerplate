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
  }

	shouldComponentUpdate(){
		return true;
	}

	componentWillUnmount(){

	}


	render() {
    const containerClassName = classNames('transition-all', 'container-comparator', {
      'container-comparator-stretch': this.props.stretchView,
      // 'container-comparator-hide': this.props.stretchView,
    });
      const screenshotTvClassName = classNames('comparator-tv-screenshot');
      const screenshotEchartClassName = classNames('comparator-echart-screenshot');

		return (
      <div className={ containerClassName } >
        <img key={ this.props.screenshotTvURL } src={ this.props.screenshotTvURL } className={ screenshotTvClassName }/>
        <img key={ this.props.screenshotEChartURL } src={ this.props.screenshotEChartURL } className={ screenshotEchartClassName }/>
      </div>
    );
	}
}

Comparator.propTypes = propTypes;
Comparator.defaultProps = defaultProps;

let stateToProps = function(state) {
	const {layout} = state;
	const {stockView, hasNewScreenshot, screenshotTvURL, screenshotEChartURL} = layout;
	return {
		stretchView: !stockView,
    hasNewScreenshot: hasNewScreenshot,
    screenshotTvURL: screenshotTvURL,
    screenshotEChartURL: screenshotEChartURL
	};
};
export default connect(stateToProps)(Comparator);
