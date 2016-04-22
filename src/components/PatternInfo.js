import React, { PropTypes } from 'react';
import classNames from 'classnames';

const propTypes = {
	pattern: PropTypes.object.isRequired,
	dispatch: PropTypes.func.isRequired,
	colomn: PropTypes.bool,
	index: PropTypes.number,
	fullView: PropTypes.bool,
};

const defaultProps = {
  	colomn: false,   			//列显示
  	//index: -1,
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

		let { column, index, fullView } = this.props;

		const smaller = !fullView && index > 0 && index < 5,
				larger = !fullView && index === 0;

		let containerClass = classNames('pattern-info-container', {
			'column': column,
			'larger': larger,
			'smaller': smaller,
		});

		let flexClass = classNames('flex-container', { 'column':  column});
		console.log(column,smaller, index);
		return (<div className = {containerClass}>
			<div className = {flexClass}>
				<div>
					<h5>相似度</h5>
					<p>{(similarity*100).toFixed(0)+'%'}</p>
				</div>
				{ (column && smaller) ? [] : (<div>
					<h5>返回</h5>
					<p>{(yieldRate*100).toFixed(1)+'%'}</p>
				</div>)}
			</div>
		</div>);
	}
}

PatternInfo.propTypes = propTypes;
PatternInfo.defaultProps = defaultProps;

export default PatternInfo;