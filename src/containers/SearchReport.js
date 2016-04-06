import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Comparator from './Comparator';
import SearchDetail from './SearchDetail';

const defaultProps = {
	fullView : false,
};

class SearchReport extends React.Component {

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
		return <div className={"transition-all container-searchreport " + (this.props.fullView ? "searchreport-full":"")}>
			<div className="inner-searchreport">
				<Comparator stretchView={this.props.fullView}/>
				<SearchDetail shrinkView={this.props.fullView}/>
			</div>
		</div>;
	}

}

SearchReport.defaultProps = defaultProps;

var stateToProps = function(state){
	const {layout} = state;
	const {stockView} = layout;
	return {
		fullView: !stockView
	}
};

export default connect(stateToProps)(SearchReport);