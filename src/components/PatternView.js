import React, { PropTypes } from 'react';
import classNames from 'classnames';
import EChart from './EChart';
import PatternInfo from './PatternInfo';
import { activeActions } from '../flux/actions';
import { getScatter, getPieSlice, getCountBar, setScatters } from '../cache/crossfilterDom';
import store from '../store';

let _clonedScatter = null; //dom object

let _selectIndustry = (industry) => {
	let matchPie = getPieSlice(industry);
	let piePath = matchPie && matchPie.lastChild;
	if(piePath) {
		$('path.outline.selected', piePath.parentNode.parentNode).removeClass('selected');
		$(piePath).addClass('selected');
	}
};

let _selectYield = (yieldRate) => {
	let node = getCountBar(yieldRate, true);
	if(node) {
		$('rect.outline.selected', node.parentNode).removeClass('selected');
		$(node).addClass('selected');
	}
};

const propTypes = {
	pattern: PropTypes.object.isRequired,
	index: PropTypes.number.isRequired,
	show: PropTypes.bool,
	fullView: PropTypes.bool.isRequired,
	isActive: PropTypes.bool,
	dispatch: PropTypes.func.isRequired,
	id: PropTypes.number.isRequired,
	filterTrashedId: PropTypes.func,
	searchConfig: PropTypes.object,
};

const defaultProps = {
  	show: true,
  	isActive: false,
};

class PatternView extends React.Component {

	constructor(props) {
		super(props);
		this.state = {showSymbol: true, isTrashed: false};
	}

	setTrashed(isTrashed) {
		if(this.state.isTrashed === isTrashed) return;
		this.setState({isTrashed});
		this.props.filterTrashedId && this.props.filterTrashedId(this.props.id, isTrashed);
	}

	componentDidMount() {
		// this.bindResizeFunc = this.handleResize.bind(this);
		// window.addEventListener('resize', this.bindResizeFunc);
		// console.debug('patternView did update');
	}

	componentWillReceiveProps(newProps){

		// let { fullView, index } = newProps;
		// let oldFullView = this.props.fullView;
		// return;
		// if((fullView === true) && (oldFullView === false) && (index < 0 || index > 5)) {
		// 	console.info('PatternView fullView changed');
		// 	let { width, height } = this.getWH();
		// 	$(this.refs.pattern_view).height(height).width(width);
		// }

		// let oldFullView = this.props.fullView;
		// if((fullView !== oldFullView) && (index > 0) && (index < 6)) {
		// 	console.info('PatternView fullView changed');
		// 	if (fullView) {  //切换到第二页
		// 		let { width, height } = this.getWH();
		// 		$(this.refs.pattern_view).removeClass('column').height(height).width(width);
		// 		$(this.refs.echart_wrapper).removeClass('larger smaller');
		// 	} else {
		// 		$(this.refs.pattern_view).addClass('column');
		// 		index === 0 ? $(this.refs.echart_wrapper).addClass('larger') : $(this.refs.echart_wrapper).addClass('smaller');
		// 	}
		// }
	}

	shouldComponentUpdate(newProps, newState){
		// if(newProps.isTrashed !== this.state.isTrashed) {
		// 	this.setState({isTrashed: newProps.isTrashed});
		// 	//return false;
		// }

		if(newProps.pattern !== this.props.pattern) {
			if(this.state.isTrashed) {
				this.setState({isTrashed: false});
			}
		}

		if((newProps.fullView !== this.props.fullView) && (newProps.index<0 || newProps.index>=5 ) ) return false;
		// console.info('shouldComponentUpdate, index:', newProps.index);
		return true;
		// return newProps.fullView === this.props.fullView; //取消自动刷新
	}

	componentWillUnmount(){
		// window.removeEventListener('resize', this.bindResizeFunc);
	}

	handleMouseEnter(){

		// this.handleMouseLeave();
		let color = '#b61c15';
			// const showSymbol = true;
			// this.setState({showSymbol});
		let {id, industry} = this.props.pattern;
		let yieldRate = this.props.pattern.yield;
		//# 1
    let matchScatter = getScatter(id);
    getScatter(id);
		if (matchScatter) {
			_clonedScatter = matchScatter.cloneNode();
			_clonedScatter.style && (_clonedScatter.style.fill = color);
			matchScatter.parentNode.appendChild(_clonedScatter);
		}
		//#2
		let matchPie = getPieSlice(industry);
		let piePath = matchPie.firstChild;// && matchPie.lastChild;
		if (piePath) {
			piePath.style.fill = color;
			matchPie.dispatchEvent(new window.MouseEvent('mouseenter'));
		}
		//#3
		let matchYieldBar = getCountBar(yieldRate, false);
		if(matchYieldBar) {
			matchYieldBar.style.fill = color;
		}

		let that = this;
    // this.setHightlightPrediction(id, true);

	}

	handleMouseLeave(){

			// const showSymbol = false;
			// this.setState({showSymbol});
			//#1
		_clonedScatter && _clonedScatter.remove && _clonedScatter.remove();
		_clonedScatter && (_clonedScatter = null);
		//#2
		let {id, industry} = this.props.pattern;
		let yieldRate = this.props.pattern.yield;

		let matchPie = getPieSlice(industry);
		let piePath = matchPie.firstChild;// && matchPie.lastChild;
		if (piePath) {
			piePath.style.fill = '';
			matchPie.dispatchEvent(new window.MouseEvent('mouseleave'));
		}
			//#3
		let matchYieldBar = getCountBar(yieldRate, false);
		if(matchYieldBar) {
			matchYieldBar.style.fill = '';
		}

		let that = this;
    // this.setHightlightPrediction(id, false);

	}

  setHightlightPrediction(id, isHighlight) {
  	let d1 = new Date();
    let patterns = this.props.patterns;
    let option = window.eChart.getOption();

    const changeColor = (data) => {
      data.lineStyle.normal.color = isHighlight ? '#c23531' : '#ccc';
      data.z = isHighlight? 1 : -1;
    };
    for (let i = option.series.length; i--;) {
      if (option.series[i].name === id) {
        changeColor(option.series[i]);
        break;
      }
    }

    window.eChart.setOption(option);

  }

	setActivePattern() {
    let widget = window.widget_comparator;
    let chart = document[window.document.getElementsByTagName('iframe')[0].id];

		let { dispatch, isActive, fullView } = this.props;
		let { id, symbol, baseBars, kLine, similarity, industry, begin, lastDate} = this.props.pattern;
    let yieldRate = this.props.pattern.yield;

		if (!fullView) {
			return;
		}

		_selectIndustry(industry);
		_selectYield(this.props.pattern.yield);
		setScatters(null, null, id);

    let dateStart = kLine[0][0];
    let dateEnd = kLine[kLine.length - 5][0];
    dispatch(activeActions.setActiveId(id, symbol, dateStart, dateEnd, similarity, yieldRate));


    let oneDay = 60 * 60 * 24;
    let dateRange = {
      from: +new Date(begin) / 1000 - oneDay * 2,
      to: +new Date(lastDate.time) / 1000 + oneDay * 2
    };

    window.timeRange = dateRange;

    let oldSymbol = widget._innerWindow().Q5.getAll()[1].model().mainSeries().symbol().split(':')[1];

    if (oldSymbol !== symbol) {
      chart.KeyStone.setSymbol(symbol, '', 1);
      this._doWhenSeries1Completed(() => {
        widget.setVisibleRange(dateRange, '1');
        window.timeRange = undefined;
      });
    } else {
      widget._innerWindow().Q5.getAll()[1].model().mainSeries().restart();
      this._doWhenSeries1Completed(() => {
        widget.setVisibleRange(dateRange, '1');
      });
    }
	}

  _doWhenSeries0Completed(callback) {
    function run() {
      let chart = document[window.document.getElementsByTagName('iframe')[0].id];
      chart.Q5.getAll()[0].model().mainSeries().onCompleted().unsubscribe(null, run);
      callback()
    };

    let chart = document[window.document.getElementsByTagName('iframe')[0].id];
    chart.Q5.getAll()[0].model().mainSeries().onCompleted().subscribe(null, run);
  }

  _doWhenSeries1Completed(callback) {
    function run() {
      let chart = document[window.document.getElementsByTagName('iframe')[0].id];
      chart.Q5.getAll()[1].model().mainSeries().onCompleted().unsubscribe(null, run);
      callback()
    };

    let chart = document[window.document.getElementsByTagName('iframe')[0].id];
    chart.Q5.getAll()[1].model().mainSeries().onCompleted().subscribe(null, run);
  }

	render(){

		let {show, pattern, dispatch, index, fullView, isActive, id} = this.props;

		const className = classNames(/*'transition-all', */'pattern-view', {
			'active': isActive,
			'hide': !show,
			'column': (!fullView && index>=0 && index<5 ),
			'larger': index === 0,
			[`smaller s${index}`] : index > 0 && index < 5,
		});

		const symbolClass = classNames('symbol-container', {'hide-symbol':!this.state.showSymbol && !isActive}); //hover显示symbol

		const echartWrapper = classNames('echart-row-wrapper', {
			'larger': !fullView && index === 0,  //第一个放大显示
			'smaller': !fullView && index > 0 && index < 5  //接下来四个缩小显示
		});

		// let style = (fullView || index>=5) && this.getWH() || { widht: '', height: ''};

		return (<div id={ `pattern_view_${id}`} ref='pattern_view' className={className} onClick={this.setActivePattern.bind(this)} onMouseEnter={this.handleMouseEnter.bind(this)} onMouseLeave={this.handleMouseLeave.bind(this)}>

			<div className={symbolClass}>{pattern.symbol}</div>

			<div className={echartWrapper} ref='echart_wrapper'>
				<EChart {...this.props} isTrashed={this.state.isTrashed} />
				<PatternInfo isTrashed={this.state.isTrashed} toggleTrash={this.setTrashed.bind(this)} pattern={pattern} dispatch={dispatch} column fullView={fullView} index={index}/>
			</div>

			{/*<PatternInfo isTrashed={this.state.isTrashed} toggleTrash={this.setTrashed.bind(this)} pattern={pattern} dispatch={dispatch} />*/}

		</div>);
	}

	getWH() {
		let baseWindow_W = 1600,
					basePatternView_W = 130,
					basePatternView_H = 182;

			let window_W = window.document.body.clientWidth;

			let pW = window_W / 1600 * 130,
					pH = window_W / 1600 * 182;

			return {width: pW + 'px', height: pH + 'px'};
	}

	handleResize() {

		let { fullView, index } = this.props;
		if(fullView || index>=5) {
			let that = this;
			setTimeout(() => {
				let { width, height } = that.getWH();
				$(that.refs.pattern_view).width(width).height(height);
			});
		}

	}

}

PatternView.propTypes = propTypes;
PatternView.defaultProps = defaultProps;

export default PatternView;
