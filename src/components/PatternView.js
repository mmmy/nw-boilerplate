import React, { PropTypes } from 'react';
import classNames from 'classnames';
import EChart from './EChart';
import PatternInfo from './PatternInfo';

const propTypes = {
	pattern: PropTypes.object.isRequired,
	index: PropTypes.number.isRequired,
	show: PropTypes.bool,
	fullView: PropTypes.bool.isRequired,
};

const defaultProps = {
  show: true
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

	render(){

		let {show, pattern, dispatch, index, fullView} = this.props;

		const className = classNames('transition-all', 'pattern-view', {
			'hide': !show,
			'column': !fullView,
			'larger': index === 0,
			'smaller': index > 0 && index < 5,
		}); 

		const symbolClass = classNames('symbol-container', {'hide-symbol':!this.state.showSymbol}); //hover显示symbol

		const echartWrapper = classNames('echart-row-wrapper', {
			'larger': !fullView && index === 0,
			'smaller': !fullView && index > 0 && index < 5
		});

		return (<div className={className} onMouseEnter={this.handleMouseEnter.bind(this)} onMouseLeave={this.handleMouseLeave.bind(this)}>
			
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