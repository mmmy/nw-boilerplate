import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { sortActions, filterActions, patternTrashActions } from '../flux/actions';
import RCSlider from 'rc-slider';
import DC from 'dc';
import * as sortTypes from '../flux/constants/SortTypes';

const SORT_BTN_DATE = { type:'SORT_BTN_DATE', label:'按日期' };
const SORT_BTN_SIMILARITY = { type:'SORT_BTN_SIMILARITY', label:'按相似度' };
const SORT_BTN_YIELD= { type:'SORT_BTN_YIELD', label:'按收益率' };

const propTypes = {
	dispatch: PropTypes.func.isRequired,
	sort: PropTypes.object.isRequired,
	crossFilter: PropTypes.object.isRequired,
};

const defaultProps = {
  	
};

class SortBar extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			showChildPanel: false,
			panelType: -1,  					//0,1,2,3
			values:{min:0, max:100},
			eyeType: 0, 								//0,1,2
			searchSymbol: ''
		};
	}

	componentDidMount() {

	}

	componentWillReceiveProps(newProps){
		if(newProps.crossFilter !== this.props.crossFilter) {
			this.setState({values: {min:0, max:100}, searchSymbol: ''});
		}
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

	renderChildPanel(panelType) {
		
		if(this.state.panelType !== panelType) {
			return '';
		}
		let handle = (e) => {
			e.stopPropagation();
		};
		switch(panelType) {
			case 0:   //sort
				return <div className='child-panel-container' onClick={handle}>
					{this.renderSortIcons(SORT_BTN_SIMILARITY)}
					{/*this.renderSortIcons(SORT_BTN_DATE)*/}
					{this.renderSortIcons(SORT_BTN_YIELD)}
				</div>;
				break;

			case 1:  //filter
				let {min, max} = this.state.values;
				return <div className='child-panel-container'>
					<span className='title-left' >相似度:</span>
					<div className='slider-container' onClick={handle}>
						<RCSlider 
							className='slider-appearance' 
							min={0} 
							max={100} 
							range 
							value={[min, max]} 
							onChange={this.rangeChange.bind(this)} 
							onAfterChange={this.rangeChangeComplete.bind(this)} 
							tipFormatter={ function(d) {return d+'%';} }
						/>
					</div>
				</div>;
				break;

			case 2:   //eye
				let {eyeType} = this.state;
				return <div className='child-panel-container flex'>
					<span className={'eye-item fa fa-'+ (eyeType===0 ? 'check-' : '') +'square-o'} onClick={this.changeEyeType.bind(this,0)}>看全部</span>
					<span className={'eye-item fa fa-'+ (eyeType===1 ? 'check-' : '') + 'square-o'} onClick={this.changeEyeType.bind(this,1)}>只看未剔除</span>
					<span className={'eye-item fa fa-'+ (eyeType===2 ? 'check-' : '') +'square-o'} onClick={this.changeEyeType.bind(this,2)}>只看剔除</span>
				</div>
				break;

			case 3:  //search
				return '';
				break;

			default:
				return '';
		}
	
	}

	render(){
		//let {sort} = this.props;
		let {panelType, searchSymbol} = this.state;
		return (<div className="toolbar-container">
				<div className='toolbar-item item0'><h5 className='left-title'>匹配图形</h5></div>
				<div className='toolbar-item item1'>
					<button className='pattern-bar-btn' onFocus={ this.toggleSearchPanel.bind(this, true) } onBlur={ this.toggleSearchPanel.bind(this, false) }>
						<span className='transition-all transition-ease transition-duration2 icon search' ref='search_icon'></span>
						<div className='transition-all transition-ease transition-duration2 child-panel-search' ref='search_panel'><input value={searchSymbol} onChange={this.changeSearchSymbol.bind(this)} ref='search_input' /><i className='fa fa-close' onClick={this.clearSearchInput.bind(this)}></i></div>
					</button>
					{/*<button className='pattern-bar-btn' onFocus={ this.showChildPanel.bind(this, 2) } onBlur={ this.hideChildPanel.bind(this) }>
						<span className={'icon eye '+(panelType===2 ? 'active' : '')}></span>
						{this.renderChildPanel(2)}
					</button>*/}
					<button className='pattern-bar-btn' onClick={ this.showChildPanel.bind(this, 1) } onBlur={ this.hideChildPanel.bind(this) }>
						<span className={'icon filter '+(panelType===1 ? 'active' : '')}></span>
						{this.renderChildPanel(1)}
					</button>
					<button className='pattern-bar-btn' onClick={ this.showChildPanel.bind(this, 0) } onBlur={ this.hideChildPanel.bind(this) }>
						<span className={'icon sort '+(panelType===0 ? 'active' : '')}></span>
						{this.renderChildPanel(0)}
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

	toggleSearchPanel(show) {
		if(show) {
			$(this.refs.search_icon).addClass('active');
			$(this.refs.search_panel).addClass('active');
			$(this.refs.search_input).focus();
		}else{
			$(this.refs.search_icon).removeClass('active');
			$(this.refs.search_panel).removeClass('active');
		}
	}

	showChildPanel(type) { //0,1,2
		if(type === this.state.panelType) {
			this.hideChildPanel();
		} else {
			this.setState({showChildPanel: true, panelType: type});
		}
	}

	hideChildPanel() {
		this.setState({showChildPanel: false, panelType: -1});
	}

	rangeChange(range){
		this.setState({values:{min:range[0], max:range[1]}});
	}

	rangeChangeComplete(range){
		console.log('rangeChangeComplete');
		this.handleFilterSimilarity();
	}

	handleFilterSimilarity() {
		this.filterSimilarity(this.state.values);
		this.props.dispatch(filterActions.setFilterSimilarity(this.state.values));	
	}
	
	filterSimilarity({min, max}) {
		this.initDimensions();
		this.similarityDim.filter([min, max]);
		DC.redrawAll();
	}

	filterSymbol(symbol){
		this.initDimensions();
		this.symbolDim.filter(function(d){ return d.indexOf(symbol) >=0; });
		DC.redrawAll();
		this.props.dispatch(filterActions.setFilterSymbol(symbol));
	}

	initDimensions() {
		let {crossFilter} = this.props;
		if(this.oldCrossFilter !== crossFilter) {
			this.symbolDim = crossFilter.dimension(function(d){ return d.symbol });
			this.similarityDim = crossFilter.dimension(function(d) {return Math.round(d.similarity*100); });
			this.oldCrossFilter = crossFilter;
		}
	}

	changeEyeType(type) {
		let {eyeType} = this.state;
		if(type===eyeType) return;
		this.setState({eyeType:type});
		let showTrashed = type === 0 || type === 2,
			showNotTrashed = type === 0 || type === 1;
		this.props.dispatch(patternTrashActions.setPatternTrashLayout(showTrashed, showNotTrashed));
	}

	changeSearchSymbol(e) {
		let symbol = e.target.value;
		this.setState({searchSymbol: symbol});
		this.filterSymbol(symbol);
	}

	clearSearchInput() {
		this.setState({searchSymbol:''});
	}
}

SortBar.propTypes = propTypes;
SortBar.defaultProps = defaultProps;

export default SortBar;