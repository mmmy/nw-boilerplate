import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Comparator from './Comparator';
import SearchDetail from './SearchDetail';
import { layoutActions } from '../flux/actions';
import classNames from 'classnames';

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
		const { fullView, statisticsLarger} = this.props;
		const className = classNames('transition-all', 'container-searchreport', {
			'searchreport-full': this.props.fullView,
		});
		const toggleClass = classNames('container-toggle', {
			'full': this.props.fullView
		});
		return (<div className={ className }>
			<div className={toggleClass}><button style={{'margin-left':'48%'}} className="btn btn-default btn-sm" onClick={this.toggleView.bind(this)}>云搜索</button></div>
			<div className="inner-searchreport">
				<Comparator />
				<SearchDetail />
			</div>
		</div>);
	}

	toggleView(){
		this.props.dispatch(layoutActions.toggleStockView());
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