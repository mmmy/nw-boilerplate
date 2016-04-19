import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { sortActions } from '../flux/actions';
import * as sortTypes from '../flux/constants/sortTypes';

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

	renderSortIcon() {
		let { sortType } = this.props.sort;
		let asc = false, desc=false;
		console.log(sortType);
		switch (sortType) {
			case sortTypes.DATE:            //日期升序
				asc = true;
				break;
			case sortTypes.DATE_R:         //日期降序
				desc = true;
				break;
			default:
				break;
		}

		let ascClass=classNames({'active':asc});
		let descClass=classNames({'active':desc});
		let icons = (<span className='sorticons-container'>
						<span className={ascClass}><i className='fa fa-sort-asc'></i></span>
						<span className={descClass}><i className='fa fa-sort-desc'></i></span>
					</span>);

		return (<div className='sort-wrapper' onClick={this.handleSort.bind(this)}>排序 {icons}</div>);
	}

	render(){
		//let {sort} = this.props;
		return (<div className="sortbar-container">
				<div className='toolbar-item'><h5>匹配图形</h5></div>
				<div className='toolbar-item'>{this.renderSortIcon()}</div>
			</div>);
	}

	handleSort(){
		this.props.dispatch(sortActions.sortByDate());
	}

}

SortBar.propTypes = propTypes;
SortBar.defaultProps = defaultProps;

export default SortBar;