import React, { PropTypes } from 'react';
import classNames from 'classnames';
import {connect} from 'react-redux';
import ReactTradingView from '../components/ReactTradingView';
import path from 'path';

const propTypes = {

};

const defaultProps = {
  show: true,
};

class Component extends React.Component {

	constructor(props) {
		super(props);
		this.defaultProps = {

		};
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

	render() {
    const containerClassName = classNames('transition-all', 'container-comparator', {
      'container-comparator-stretch': this.props.stretchView,
    });

    const screenshotPrediction = path.join('..', 'src/static/img', 'chart-screenshot.png');
    const screenshotOrigin = path.join('..', 'src/static/img', 'chart-screenshot-origin.png');

    const screenshotPredictionClassName = classNames('comparator-chart-screenshot');
    const screenshotOriginClassName = classNames(
    'comparator-chart-screenshot', {
      'comparator-chart-screenshot-origin-slide': this.props.stretchView,
      'comparator-chart-screenshot-origin-slide-transition': this.props.stretchView
     });

		return (
      <div className={ containerClassName } >
        <img src={ screenshotPrediction } className={ screenshotPredictionClassName }/>
        <img src={ screenshotOrigin } className={ screenshotOriginClassName }/>
      </div>
    );
	}
}

Component.propTypes = propTypes;
Component.defaultProps = defaultProps;

var stateToProps = function(state) {
	const {layout} = state;
	const {stockView} = layout;
	return {
		stretchView: !stockView,
	};
};
export default connect(stateToProps)(Component);
