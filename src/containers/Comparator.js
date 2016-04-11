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

    const screenshot = path.join('..', 'src/static/img', 'chart-screenshot.png');

    const screenshotClassName = classNames('comparator-chart-screenshot');

		return (
      <div className={ containerClassName } >
        <img src={ screenshot } className={ screenshotClassName }/>
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
