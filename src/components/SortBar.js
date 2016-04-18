import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { sortActions } from '../flux/actions';

const propTypes = {
	dispatch: PropTypes.func.isRequired,
	sort: PropTypes.object.isRequired,
};

const defaultProps = {
  	
};

class SortBar extends React.Component {

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
		//let {sort} = this.props;
		return (<div className="sortbar-container">
				{<button onClick={this.handleSort.bind(this)}>sort</button>}
			</div>);
	}

	handleSort(){
		this.props.dispatch(sortActions.sortByDate());
	}

}

SortBar.propTypes = propTypes;
SortBar.defaultProps = defaultProps;

export default SortBar;