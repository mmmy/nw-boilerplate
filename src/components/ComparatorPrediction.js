import React, { PropTypes } from 'react';
import classNames from 'classnames';

const propTypes = {

};

const defaultProps = {

};

class ComparatorPrediction extends React.Component {

	constructor(props) {
		super(props);
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

	render(){
    let className = classNames('comparator-prediction');
		return (
      <div className={ className }></div>
    );
	}
}

ComparatorPrediction.propTypes = propTypes;
ComparatorPrediction.defaultProps = defaultProps;

export default ComparatorPrediction;
