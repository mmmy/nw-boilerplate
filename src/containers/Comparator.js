import React, { PropTypes } from 'react';
import classNames from 'classnames';
import {connect} from 'react-redux';
import path from 'path';

const propTypes = {
	stretchView: PropTypes.bool
};

const defaultProps = {

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

    const screenshotPredictionClassName = classNames('comparator-chart-screenshot');

		return (
      <div className={ containerClassName } >
        <img src={ screenshotPrediction } className={ screenshotPredictionClassName }/>
      </div>
    );
	}
}

Component.propTypes = propTypes;
Component.defaultProps = defaultProps;

let stateToProps = function(state) {
	const {layout} = state;
	const {stockView} = layout;
	return {
		stretchView: !stockView,
	};
};
export default connect(stateToProps)(Component);
