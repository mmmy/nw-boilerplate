import React, { PropTypes } from 'react';
import Switch from './Switch';
import classNames from 'classnames';

const propTypes = {
	pattern: PropTypes.object.isRequired,
	dispatch: PropTypes.func.isRequired,
	colomn: PropTypes.bool,
	index: PropTypes.number,
	fullView: PropTypes.bool,
	isTrashed: PropTypes.bool,
	toggleTrash: PropTypes.func
};

const defaultProps = {
  	colomn: false,   			//列显示
  	//index: -1,
};

class PatternInfo extends React.Component {

	constructor(props) {
		super(props);
		this.state = {showSwitch: false};
	}

	componentDidMount() {

	}

	componentWillReceiveProps(){

	}

	shouldComponentUpdate(newProps){

		let {similarity} = newProps.pattern;
		let yieldRate = newProps.pattern.yield;

		let {old_similarity} = this.props.pattern;
		let old_yieldRate = this.props.pattern.yield;

		//属性发生变化才渲染
		if (old_similarity === similarity && old_yieldRate == yieldRate) {
			return false;
		}

		return true;
	}

	componentWillUnmount(){

	}

	render(){
		//console.log('pattern-info-container');
		let {similarity} = this.props.pattern;
		let yieldRate = this.props.pattern.yield;

		let { column, index, fullView, isTrashed } = this.props;

		const smaller = !fullView && index > 0 && index < 5,
				larger = !fullView && index === 0;

		let containerClass = classNames('pattern-info-container', {
			'column': column,
			'larger': larger,
			'smaller': smaller,
		});

		let flexClass = classNames('flex-container', { 'column':  column});
		let switchWidget = this.state.showSwitch ? <div className='pattern-info-switch-wrapper'><Switch trasded={isTrashed} onToggle={this.props.toggleTrash}/></div> : '';
		// console.log(column,smaller, index);

		return (<div className = {containerClass} onMouseEnter={this.mouseEnter.bind(this)} onMouseLeave={this.mouseLeave.bind(this)}>
			<div className = {flexClass}>
				<div>
					<h5>相似度</h5>
					<p className='font-number'>{(similarity*100 + '').slice(0, 4)}{'%'}</p>
				</div>
				{ (column && smaller) ? [] : (<div>
					<h5>返回</h5>
					<p className='font-number'>{(yieldRate*100).toFixed(1)+'%'}</p>
				</div>)}
			</div>
			{switchWidget}
		</div>);
	}

	mouseEnter() {
		let {column} = this.props;
		if(!column) {
			this.setState({showSwitch: true});
		}
	}

	mouseLeave() {
		this.setState({showSwitch: false});
	}

}

PatternInfo.propTypes = propTypes;
PatternInfo.defaultProps = defaultProps;

export default PatternInfo;