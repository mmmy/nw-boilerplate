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
      screenshot_origin_path: null
    };
	}

	componentDidMount() {
    this.state.screenshot_origin_path = path.join('..', 'src/image/screenshot_origin.png');
	}

	componentWillReceiveProps(){

	}

  componentDidUpdate() {
    this.state.screenshot_origin_path = path.join('..', 'src/image/screenshot_origin.png');
  }

	shouldComponentUpdate(){
		return true;
	}

	componentWillUnmount(){

	}

  getScreenshort() {
    const screenshotPrediction = path.join('..', 'src/image/screenshot_origin.png') + '?random_number=' + new Date().getTime();
    const screenshotPredictionClassName = classNames('comparator-chart-screenshot');

    return (
      <img key={ screenshotPrediction } src={ screenshotPrediction } className={ screenshotPredictionClassName }/>
    );
  }

	render() {
    const containerClassName = classNames('transition-all', 'container-comparator', {
      'container-comparator-stretch': this.props.stretchView,
    });
    //const screenshotPrediction = path.join('./image','chart-screenshot.png');

    const screenshot = this.props.hasNewScreenshot ? this.getScreenshort() : path.join('..', 'src/image/screenshot_origin.png');

		return (
      <div className={ containerClassName } >
        { screenshot }
      </div>
    );
	}
}

Comparator.propTypes = propTypes;
Comparator.defaultProps = defaultProps;

let stateToProps = function(state) {
	const {layout} = state;
	const {stockView, hasNewScreenshot} = layout;
	return {
		stretchView: !stockView,
    hasNewScreenshot: hasNewScreenshot
	};
};
export default connect(stateToProps)(Comparator);
