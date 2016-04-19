import React, { PropTypes } from 'react';
import classNames from 'classnames';

const propTypes = {
	pattern: PropTypes.object.isRequired,
	dispatch: PropTypes.func.isRequired,
};

const defaultProps = {
  
};

class PatternInfo extends React.Component {

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

		let {similarity} = this.props.pattern;
		let yieldRate = this.props.pattern.yield;
		return (<div className="pattern-info-container">
			<div className='flex-container'>
				<div>
					<h5>相似度</h5>
					<p>{(similarity*100).toFixed(0)+'%'}</p>
				</div>
				<div>
					<h5>返回</h5>
					<p>{(yieldRate*100).toFixed(1)+'%'}</p>
				</div>
			</div>
		</div>);
	}
}

PatternInfo.propTypes = propTypes;
PatternInfo.defaultProps = defaultProps;

export default PatternInfo;