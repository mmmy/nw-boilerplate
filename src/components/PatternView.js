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

	}

	componentWillReceiveProps(){

	}

	shouldComponentUpdate(){
		return true;
	}

	componentWillUnmount(){

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

		let { dispatch } = this.props;
		let { id, symbol, baseBars, kLine } = this.props.pattern;

    let dateStart = kLine[0][0];
    let dateEnd = kLine[baseBars - 1][0];

		dispatch(activeActions.setActiveId(id, symbol, dateStart, dateEnd));

    let chart = document[window.document.getElementsByTagName('iframe')[0].id];
    chart.Q5.getAll()[1].setSymbol(symbol);

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

		return (<div className={className} onClick={this.setActivePattern.bind(this)} onMouseEnter={this.handleMouseEnter.bind(this)} onMouseLeave={this.handleMouseLeave.bind(this)}>

			<div className={symbolClass}>{pattern.symbol}</div>

			<div className={echartWrapper}>
				<EChart {...this.props} />
				<PatternInfo pattern={pattern} dispatch={dispatch} column fullView={fullView} index={index}/>
			</div>

			<PatternInfo pattern={pattern} dispatch={dispatch} />

		</div>);
	}
}

PatternView.propTypes = propTypes;
PatternView.defaultProps = defaultProps;

export default PatternView;
