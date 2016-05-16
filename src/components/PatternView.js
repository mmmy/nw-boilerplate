import React, { PropTypes } from 'react';
import classNames from 'classnames';
import EChart from './EChart';
import PatternInfo from './PatternInfo';
import { activeActions } from '../flux/actions';

const propTypes = {
	pattern: PropTypes.object.isRequired,
	index: PropTypes.number.isRequired,
	show: PropTypes.bool,
	fullView: PropTypes.bool.isRequired,
	isActive: PropTypes.bool,
	dispatch: PropTypes.func.isRequired,
};

const defaultProps = {
  	show: true,
  	isActive: false,
};

class PatternView extends React.Component {

	constructor(props) {
		super(props);
		this.state = {showSymbol: false};
	}

	componentDidMount() {
		this.bindResizeFunc = this.handleResize.bind(this);
		window.addEventListener('resize', this.bindResizeFunc);
	}

	componentWillReceiveProps(){

	}

	shouldComponentUpdate(){
		return true;
	}

	componentWillUnmount(){
		window.removeEventListener('resize', this.bindResizeFunc);
	}

	handleMouseEnter(){

			const showSymbol = true;
			this.setState({showSymbol});
	}

	handleMouseLeave(){

			const showSymbol = false;
			this.setState({showSymbol});

	}

	setActivePattern() {

		let { dispatch, isActive } = this.props;
		let { id, symbol, baseBars, kLine } = this.props.pattern;

    let dateStart = kLine[0][0];
    let dateEnd = kLine[baseBars - 1][0];

    let chart = document[window.document.getElementsByTagName('iframe')[0].id];
    if (!isActive) chart.Q5.getAll()[1].setSymbol(symbol);
    chart.TradingView.gotoDate(chart.Q5.getAll()[1], +new Date(dateStart));
    dispatch(activeActions.setActiveId(id, symbol, dateStart, dateEnd));
	}

	render(){

		let {show, pattern, dispatch, index, fullView, isActive} = this.props;

		const className = classNames('transition-all', 'pattern-view', {
			'active': isActive,
			'hide': !show,
			'column': !fullView,
			'larger': index === 0,
			'smaller': index > 0 && index < 5,
		});

		const symbolClass = classNames('symbol-container', {'hide-symbol':!this.state.showSymbol && !isActive}); //hover显示symbol

		const echartWrapper = classNames('echart-row-wrapper', {
			'larger': !fullView && index === 0,
			'smaller': !fullView && index > 0 && index < 5
		});

		let style = fullView && this.getWH() || { widht: '', height: ''};

		return (<div style={style} ref='pattern_view' className={className} onClick={this.setActivePattern.bind(this)} onMouseEnter={this.handleMouseEnter.bind(this)} onMouseLeave={this.handleMouseLeave.bind(this)}>

			<div className={symbolClass}>{pattern.symbol}</div>

			<div className={echartWrapper}>
				<EChart {...this.props} />
				<PatternInfo pattern={pattern} dispatch={dispatch} column fullView={fullView} index={index}/>
			</div>

			<PatternInfo pattern={pattern} dispatch={dispatch} />

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

		let { fullView } = this.props;
		if(fullView) {

			let { width, height } = this.getWH();

			$(this.refs.pattern_view).width(width).height(height);
		}

	}

}

PatternView.propTypes = propTypes;
PatternView.defaultProps = defaultProps;

export default PatternView;
