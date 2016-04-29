import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { sortActions } from '../flux/actions';
import * as sortTypes from '../flux/constants/SortTypes';

const SORT_BTN_DATE = { type:'SORT_BTN_DATE', label:'按日期' };
const SORT_BTN_SIMILARITY = { type:'SORT_BTN_SIMILARITY', label:'按相似度' };
const SORT_BTN_YIELD= { type:'SORT_BTN_YIELD', label:'按收益率' };

const propTypes = {
	dispatch: PropTypes.func.isRequired,
	sort: PropTypes.object.isRequired,
};

const defaultProps = {
  	
};

class SortBar extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			showSortPanel: false
		};
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

	renderSortIcons(btnType) {

		let { sortType } = this.props.sort;
		let asc = false, desc=false;
		console.log(sortType);
		
		switch (sortType) {
			case sortTypes.DATE:            //日期升序
				if(btnType.type === SORT_BTN_DATE.type) { asc = true; }
				break;
			case sortTypes.DATE_R:         //日期降序
				if(btnType.type === SORT_BTN_DATE.type ) { desc = true; }
				break;
			case sortTypes.SIMILARITY:
				if(btnType.type === SORT_BTN_SIMILARITY.type) { asc = true; }
				break;
			case sortTypes.SIMILARITY_R:
				if(btnType.type === SORT_BTN_SIMILARITY.type) { desc = true; }
				break;
			case sortTypes.YIELD:
				if(btnType.type === SORT_BTN_YIELD.type) { asc = true; }
				break;
			case sortTypes.YIELD_R:
				if(btnType.type === SORT_BTN_YIELD.type) { desc = true; }
				break;
			default:
				break;
		}

		let ascClass=classNames({'active':asc});
		let descClass=classNames({'active':desc});
		let icons = (asc || desc) ? (<span className='sorticons-container'>
						<span className={ascClass}><i className='fa fa-sort-asc'></i></span>
						<span className={descClass}><i className='fa fa-sort-desc'></i></span>
					</span>) : '';

		let btnClass = classNames('sort-btn', {
			'active': asc || desc
		});
		return (<a className={btnClass} onClick={this.handleSort.bind(this, btnType.type)} >{ btnType.label } <span className='sort-icon'>{ icons }</span></a>);
	}

	renderSortPanel() {
		
		if(this.state.showSortPanel === false) {
			return '';
		}

		return <div className='sort-panel-container'>
			{this.renderSortIcons(SORT_BTN_SIMILARITY)}
			{this.renderSortIcons(SORT_BTN_DATE)}
			{this.renderSortIcons(SORT_BTN_YIELD)}
		</div>;
	
	}

	render(){
		//let {sort} = this.props;
		return (<div className="sortbar-container">
				<div className='toolbar-item'><h5>匹配图形</h5></div>
				<div className='toolbar-item'>
					<button className='sort-trigger-btn' onFocus={ this.showSortPanel.bind(this) } onBlur={ this.hideSortPanel.bind(this) }>
						排序
						{this.renderSortPanel()}
					</button>
				</div>
			</div>);
	}

	handleSort(type, e) {

		switch (type) {
			case SORT_BTN_DATE.type:
				this.props.dispatch(sortActions.sortByDate());
				break;
			case SORT_BTN_SIMILARITY.type:
				this.props.dispatch(sortActions.sortBySimilarity());
				break;
			case SORT_BTN_YIELD.type:
				this.props.dispatch(sortActions.sortByYield());
				break;
			default:
			 	break;
		}

	}

	showSortPanel() {
		this.setState({showSortPanel: true});
	}

	hideSortPanel() {
		this.setState({showSortPanel: false});
	}
}

SortBar.propTypes = propTypes;
SortBar.defaultProps = defaultProps;

export default SortBar;