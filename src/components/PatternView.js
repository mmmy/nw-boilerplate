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
	id: PropTypes.number.isRequired,
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
		if((newProps.fullView !== this.props.fullView) && (newProps.index<0 || newProps.index>=5 ) ) return false;
		console.info('shouldComponentUpdate, index:', newProps.index);
		return true;
		// return newProps.fullView === this.props.fullView; //取消自动刷新
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

    let dateStart = kLine[baseBars][0];
    let dateEnd = kLine[baseBars - 1][0];
    dispatch(activeActions.setActiveId(id, symbol, dateStart, dateEnd));

    let chart = document[window.document.getElementsByTagName('iframe')[0].id];
    if (!isActive) chart.KeyStone.setSymbol(symbol, '', 1, () => {
      chart.KeyStone.gotoDate(chart.Q5.getAll()[1], +new Date(dateStart));
    });
	}

	render(){

		let {show, pattern, dispatch, index, fullView, isActive, id} = this.props;

		const className = classNames('transition-all', 'pattern-view', {
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

		let style = (fullView || index>=5) && this.getWH() || { widht: '', height: ''};

		return (<div style={style} id={ `pattern_view_${id}`} ref='pattern_view' className={className} onClick={this.setActivePattern.bind(this)} onMouseEnter={this.handleMouseEnter.bind(this)} onMouseLeave={this.handleMouseLeave.bind(this)}>

			<div className={symbolClass}>{pattern.symbol}</div>

			<div className={echartWrapper} ref='echart_wrapper'>
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
