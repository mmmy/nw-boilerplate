import React, { PropTypes } from 'react';
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

export default SearchReport;