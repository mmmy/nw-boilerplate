import React, { PropTypes } from 'react';
import PatternView from './PatternView';

const propTypes = {
	data: PropTypes.array.isRequired,
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
		return (<div className="pattern-collection">
			{ this.props.data.map((e, i) => {
				return <PatternView kLine={e} key={i} index={i}/>
			}) }
		</div>);
	}
}

PatternCollection.propTypes = propTypes;
PatternCollection.defaultProps = defaultProps;

export default PatternCollection;