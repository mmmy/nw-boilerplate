import React, { PropTypes } from 'react';
import Switch from './Switch';
import classNames from 'classnames';
import store from '../store';
import {getDecimalForStatistic} from '../shared/storeHelper';

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

let _decimal = 2;

class PatternInfo extends React.Component {

	constructor(props) {
		super(props);
		this.state = {showSwitch: false};
	}

	componentDidMount() {

	}

	componentWillReceiveProps(newProps){
		if(newProps.index == 0 && newProps.pattern != this.props.pattern) {
			_decimal = getDecimalForStatistic();
		}
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
		let {similarity, vsimilarity} = this.props.pattern;
		similarity = typeof similarity == 'undefined' ? 0 : similarity;
		vsimilarity = typeof vsimilarity == 'undefined' ? 0 : vsimilarity;
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
		let brownRed = $.keyStone.configDefault.brownRed || '#8D151B';
		let returnClass = classNames('font-number after-icon', {
			up: yieldRate > 0,
			plain: yieldRate == 0,
			down: yieldRate < 0,
		});

		return (<div className = {containerClass} onMouseEnter={this.mouseEnter.bind(this)} onMouseLeave={this.mouseLeave.bind(this)}>
			<div className = {flexClass}>
				<div className='item'>
					<h5 className='font-simsun'>价相似度</h5>
					<p className='font-number'>{(similarity.toFixed(4)*100 + '').slice(0, 4)}{'%'}</p>
				</div>
				<div className='item'>
					<h5 className='font-simsun'>量相似度</h5>
					<p className='font-number'>{(vsimilarity.toFixed(4)*100 + '').slice(0, 4)}{'%'}</p>
				</div>
				{ (column && smaller) ? [] : (<div className='item return'>
					<h5 className='font-simsun'>涨跌</h5>
					<p className={returnClass}>{(yieldRate*100).toFixed(_decimal)+'%'}</p>
				</div>)}
			</div>
			{switchWidget}
		</div>);
	}

	mouseEnter() {
		let {column} = this.props;
		let fullView = !store.getState().layout.stockView;
		if(fullView) {
			this.setState({showSwitch: true});
		}
	}

	mouseLeave() {
		if(this.state.showSwitch) {
			this.setState({showSwitch: false});
		}
	}

}

PatternInfo.propTypes = propTypes;
PatternInfo.defaultProps = defaultProps;

export default PatternInfo;