import React, { PropTypes } from 'react';
import classNames from 'classnames';

const propTypes = {

};

const defaultProps = {

};

class ComparatorPredition extends React.Component {

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
    let className = classNames('comparator-predition');
		return (
      <div className={ className }></div>
    );
	}
}

ComparatorPredition.propTypes = propTypes;
ComparatorPredition.defaultProps = defaultProps;

export default ComparatorPredition;
