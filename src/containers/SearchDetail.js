import React, { PropTypes } from 'react';
import PatternContainer from './PatternContainer';
import StatisticsContainer from './StatisticsContainer';
import {connect} from 'react-redux';
// import { updateImgAll } from '../components/helper/updateEchartImage';
import classNames from 'classnames';
import CrossfilterContainer from './CrossfilterContainer';

const propTypes = {
	shrinkView: PropTypes.bool
};

let _isSmall = null;

const defaultProps = {
  
};

class SearchDetail extends React.Component {

	constructor(props) {
		super(props);
		this.defaultProps = {

		};
		this.state = {};
	}

	componentDidMount() {
		// _isSmall = window.document.body.clientWidth < 1450;
		// this._handleResize = this.handleResize.bind(this);
		// window.addEventListener('resize', this._handleResize);
		// this.handleResize();
		// updateImgAll(0);
	}

	componentWillReceiveProps(){

	}

	shouldComponentUpdate(){
		return true;
	}

	componentDidUpdate() {
		this.relayout(_isSmall);
	}

	componentWillUnmount(){
		// window.removeEventListener('resize', this._handleResize);
	}

	render(){
		let className = classNames('transition-all', 'container-searchdetail', {
			'searchdetail-shrink': this.props.shrinkView,
		});
		return (<div className={ className } ref='container'>
			<StatisticsContainer />
			<PatternContainer />
			<CrossfilterContainer />
		</div>);
	}

	handleResize() {
		return;
		let baseW = 1450;
		let bodyW = window.document.body.clientWidth;

		let small = bodyW < baseW;
		if(_isSmall !== small) {
			_isSmall = small;
			this.relayout(small);
			// this.props.shrinkView && updateImgAll(small ? 1 : 0);
		}
	}

	relayout(small) {
		let statisticsContianer = this.refs.container.firstChild,
			patternContainer = this.refs.container.lastChild;
		if (small) {
			$(this.refs.container).addClass('small');
		} else {
			$(this.refs.container).removeClass('small');
		}
	}
}

SearchDetail.propTypes = propTypes;
SearchDetail.defaultProps = defaultProps;


let stateToProps = function(state) {
	const {layout} = state;
	const {stockView} = layout;
	return {
		shrinkView: !stockView,
	};
};

export default connect(stateToProps)(SearchDetail);