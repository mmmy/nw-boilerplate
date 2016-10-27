import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import CrossfilterView from '../components/CrossfilterView';

const propTypes = {

};

const defaultProps = {
  
};

class CrossfilterContainer extends React.Component {

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
		let { dispatch, fullView, crossFilter } = this.props;
		let className = classNames('crossfilter-out-container');
		return (<div className={ className }>
				<div className='title-container'>
					<h3 className='title'>可视化统计</h3>
				</div>
				<div className='crossfilter-wrapper'>
					<CrossfilterView 
						dispatch={dispatch}
						crossFilter={crossFilter}
						stretchView={fullView}
					/>
				</div>
			</div>);
	}
}

CrossfilterContainer.propTypes = propTypes;
CrossfilterContainer.defaultProps = defaultProps;

let stateToProps = function(state) {
	let crossFilter = state.patterns.crossFilter,
			fullView = !state.layout.stockView;
	return {
		crossFilter,
		fullView
	};
};

export default connect(stateToProps)(CrossfilterContainer);