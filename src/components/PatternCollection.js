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

	getPatternNodes() {
		
		let { dispatch, waitingForPatterns } = this.props;
		let { crossFilter, rawData } = this.props.patterns;

		let nodes = null;

		if (waitingForPatterns) {

			nodes = (<div>正在获取数据...</div>);

		} else {

			let filteredData = crossFilter.dimension(e=>{ return e.symbol; }).top(Infinity),
				idArr = _.pluck(filteredData, 'id');
			
			nodes = rawData.map((e, i) => {
				let show = idArr.indexOf(e.id) != -1;
				return <PatternView show={show} pattern={e} key={i} index={i} dispatch={dispatch}/>
			});

		}

		return nodes;
	}

	render(){
		

		return (<div className="pattern-collection">
			{ this.getPatternNodes() }
		</div>);
	}
}

PatternCollection.propTypes = propTypes;
PatternCollection.defaultProps = defaultProps;

export default PatternCollection;