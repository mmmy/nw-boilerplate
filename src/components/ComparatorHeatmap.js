import React, { PropTypes } from 'react';
import classNames from 'classnames';

const propTypes = {

};

const defaultProps = {

};

class ComparatorHeatmap extends React.Component {

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
    const className = classNames('comparator-heatmap');
		return (
      <div className={ className }></div>
    );
	}
}

ComparatorHeatmap.propTypes = propTypes;
ComparatorHeatmap.defaultProps = defaultProps;

export default ComparatorHeatmap;
