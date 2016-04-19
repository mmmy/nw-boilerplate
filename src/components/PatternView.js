import React, { PropTypes } from 'react';
import classNames from 'classnames';
import EChart from './EChart';
import PatternInfo from './PatternInfo';

const propTypes = {
	pattern: PropTypes.object.isRequired,
	index: PropTypes.number.isRequired,
	show: PropTypes.bool
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

		let {show, pattern, dispatch} = this.props;

		const className = classNames('transition-all', 'pattern-view', {'hide': !show});
		const symbolClass = classNames('symbol-container', {'hide-symbol':!this.state.showSymbol});

		return (<div className={className} onMouseEnter={this.handleMouseEnter.bind(this)} onMouseLeave={this.handleMouseLeave.bind(this)}>
			<div className={symbolClass}>{pattern.symbol}</div>
			<EChart {...this.props} />
			<PatternInfo pattern={pattern} dispatch={dispatch}/>
		</div>);
	}
}

PatternView.propTypes = propTypes;
PatternView.defaultProps = defaultProps;

export default PatternView;