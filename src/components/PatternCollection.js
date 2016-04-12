import React, { PropTypes } from 'react';
import PatternView from './PatternView';

const propTypes = {
	patterns: PropTypes.object.isRequired,
	dispatch: PropTypes.func.isRequired,
	fullView: PropTypes.bool.isRequired
};

const defaultProps = {
  	
};

class PatternCollection extends React.Component {

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
		let { dispatch } = this.props;
		let { crossFilter, rawData } = this.props.patterns;

		let data = crossFilter.dimension(e=>{ return e.symbol; }).top(Infinity);
		return (<div className="pattern-collection">
			{ data.map((e, i) => {
				return <PatternView pattern={e} key={i} index={i} dispatch={dispatch}/>
			}) }
		</div>);
	}
}

PatternCollection.propTypes = propTypes;
PatternCollection.defaultProps = defaultProps;

export default PatternCollection;