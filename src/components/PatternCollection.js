import React, { PropTypes } from 'react';
import PatternView from './PatternView';
import _ from 'underscore';
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

		let filteredData = crossFilter.dimension(e=>{ return e.symbol; }).top(Infinity),
			idArr = _.pluck(filteredData, 'id');
		return (<div className="pattern-collection">
			{ rawData.map((e, i) => {
				let show = idArr.indexOf(e.id) != -1;
				return <PatternView show={show} pattern={e} key={i} index={i} dispatch={dispatch}/>
			}) }
		</div>);
	}
}

PatternCollection.propTypes = propTypes;
PatternCollection.defaultProps = defaultProps;

export default PatternCollection;