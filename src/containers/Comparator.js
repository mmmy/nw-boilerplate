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

  getScreenshort() {
    const screenshotPrediction = path.join('..', 'src/image/screenshort_origin.png');
    const screenshotPredictionClassName = classNames('comparator-chart-screenshot');

    return (
      <img src={ screenshotPrediction } className={ screenshotPredictionClassName }/>
    );
  }

	render() {
    const containerClassName = classNames('transition-all', 'container-comparator', {
      'container-comparator-stretch': this.props.stretchView,
    });
    //const screenshotPrediction = path.join('./image','chart-screenshot.png');
    const screenshot = this.getScreenshort();

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
	const {stockView} = layout;
	return {
		stretchView: !stockView,
	};
};
export default connect(stateToProps)(Comparator);
