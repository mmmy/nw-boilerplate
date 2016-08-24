import React, { PropTypes } from 'react';
import PatternView from '../components/PatternView';
import { connect } from 'react-redux';
import * as sortTypes from '../flux/constants/SortTypes';
import { filterActions } from '../flux/actions';
import _ from 'underscore';
import lodash from 'lodash';
import classNames from 'classnames';
import DC from 'dc';
import { updateImgAll } from '../components/helper/updateEchartImage';

const propTypes = {
	patterns: PropTypes.object.isRequired,
	dispatch: PropTypes.func.isRequired,
	fullView: PropTypes.bool.isRequired,
	// waitingForPatterns: PropTypes.bool.isRequired,
	sort: PropTypes.object.isRequired,
	active: PropTypes.object.isRequired,
	filter: PropTypes.object,
};

const defaultProps = {
  	
};

let _oldPatternRawData = null;
//note 重要: crossfilter 生成的dimensions数量不能超过128个 , 所以要注意保存dimension !!
let _idTrashed = [];  //记录剔除状态
let setTrashed = (id) => { _idTrashed[id] = true };
let resetTrashed = () => { _idTrashed[id] = undefined };
let isTrashed = (id) => { return _idTrashed[id]; };
let _setIdTrashed = (idArr, isTrashed) => {   //批量设置 
	// console.log('setIdTrashed----'); 
	let that = _setIdTrashed.proptotype._patterncollection;
	idArr.length && idArr.forEach(id => { 
		// _idTrashed[id]=isTrashed 
		that.refs[`pattern_view_${id}`].setTrashed(isTrashed);
	});  
	// console.log(_setIdTrashed.proptotype._patterncollection);
	// that.setState({});
};

_setIdTrashed.proptotype={_patterncollection: null};

let __visibleNumber = 0;

let generatePlaceHolder = (count = 5) => { //1,2,3,4,5
	let largerHolder = `<div class='pattern-view column larger holder'></div>`,
			smallerHolder1 = `<div class='pattern-view column smaller s1 holder'></div>`,
			smallerHolder2 = `<div class='pattern-view column smaller s2 holder'></div>`,
			smallerHolder3 = `<div class='pattern-view column smaller s3 holder'></div>`,
			smallerHolder4 = `<div class='pattern-view column smaller s4 holder'></div>`;
	let arr = [largerHolder, smallerHolder1, smallerHolder2, smallerHolder3, smallerHolder4];
	return arr.slice(arr.length - count);
};

class PatternCollection extends React.Component {

	constructor(props) {
		super(props);
		this.state = {};
		let that = this;

		this._debounceRedrawDc = lodash.debounce(() => {
			console.log('o0o0o0o0o0o0o0o00o0o0    debounce func called ... !');
			that.idDim && that.idDim.filterFunction((d) => { return !_idTrashed[d]; });
			DC.redrawAll();
			that.props.dispatch(filterActions.setFilterId(_idTrashed.concat([])));
			//显示垃圾桶数目
			// setTimeout(() => {
				let trashedNumber = _idTrashed.reduce((pre,cur) => { return cur ? (pre + 1) : pre; }, 0);
				$('.trashed-number', '.pattern-statistics-panel').text(trashedNumber);
			// });
		}, 100, {leading: true});
		//this._idTrashed = _idTrashed;
	}

	componentDidMount() {
		_oldPatternRawData = this.props.patterns.rawData;
		_setIdTrashed.proptotype._patterncollection = this;
	}

	componentWillReceiveProps(newProps) { //优化性能
		// let { id } = newProps.active;
		// let oldId = this.props.active.id;
		// if(id !== this.props.active.id) {
		// 	console.log('xxxxxxxxxxxxxxxx');
		// 	$(`#pattern_view_${id}`,this.refs.container).addClass('active');
		// 	$(`#pattern_view_${oldId}`,this.refs.container).removeClass('active');
		//return;
		
		/**
		 * filter手动刷新
		 */
		//return;
		let {crossFilter} = newProps.patterns;
		if(this.oldCrossFilter !== crossFilter) {

			console.info('crossFilter changed!');
			updateImgAll(-1); //隐藏之前的图片
			this.oldCrossFilter = crossFilter;
			this.symbolDim = crossFilter.dimension(e=>{ return e.symbol; });
			//idDim , 剔除dimentsion
			this.idDim = crossFilter.dimension(d=>{ return d.id; });
			_idTrashed = [];
			$('.trashed-number', '.pattern-statistics-panel').text('');
			

		}

		let hideHelper = () => {
			let {showNotTrashed, showTrashed} = newProps.patternTrashed;
			//console.info('idarr', idArr);
			let that = this;
			setTimeout(() => {
				let filteredData = that.symbolDim.top(Infinity),
						idArr = _.pluck(filteredData, 'id'),
						node = that.refs.container;
				$('.pattern-view', node).addClass('hide');
				if(showNotTrashed){
					idArr.forEach((id) => {
						$(`#pattern_view_${id}`,node).removeClass('hide');
					});
				}
				if(showTrashed) {
					_idTrashed.forEach((isTrashed, id) => {
						isTrashed && $(`#pattern_view_${id}`,node).removeClass('hide');
					});
				}		
			});
		};

		if( newProps.filter !== this.props.filter ){
			hideHelper();
		}

		if( newProps.patternTrashed !== this.props.patternTrashed ) {
			hideHelper();
		}
		/**
		 * 点击pattern手动刷新
		 */
		let { id } = newProps.active;
		let oldId = this.props.active.id;
		if(id !== this.props.active.id) {
			console.log('手动刷新active id显示');
			$(`#pattern_view_${id}`,this.refs.container).addClass('active');
			$(`#pattern_view_${oldId}`,this.refs.container).removeClass('active');
		}

		return;
		/**
		 * 切换视图
		 */
		let { fullView } = newProps,
				oldFullView = this.props.fullView;
		if (fullView !== oldFullView) {
			let leading5 = $(">*:visible", this.refs.container);
			console.info(leading5);
			let node1 = $(leading5[0]),
					node2 = $(leading5[1]),
					node3 = $(leading5[2]),
					node4 = $(leading5[3]),
					node5 = $(leading5[4]);

			if(fullView) {
				node1.removeClass('column larger');
				node2.removeClass('column smaller s1');
				node3.removeClass('column smaller s2');
				node4.removeClass('column smaller s3');
				node5.removeClass('column smaller s4');
			} else {
				node1.addClass('column larger');
				node2.addClass('column smaller s1');
				node3.addClass('column smaller s2');
				node4.addClass('column smaller s3');
				node5.addClass('column smaller s4');
				this.refs.container.scrollTop = 0;
			}
		}

	}

	shouldComponentUpdate(newProps, newState) {
		//return true;
		//pattern 改变 的时候 只渲染前5个, 结局搜索后渲染时间过长的问题
		if(newProps.patterns.rawData !== _oldPatternRawData) {
			this.renderLeading5 = true;
			_oldPatternRawData = newProps.patterns.rawData;
			let that = this;
			// setTimeout(() => { that.setState({}); }, 2000);
		} else {
			this.renderLeading5 = false;
		}

		return 	(newProps.filter === this.props.filter)    //filter更新后不进行自动刷新, 而是在componentWillReceiveProps 进行手动刷新
						&& (newProps.active.id === this.props.active.id)   //点击patternview
						&& (newProps.patternTrashed === this.props.patternTrashed) //eye
						//&& (newProps.fullView === this.props.fullView)   //视图切换
		// return (newProps.sort !== this.props.sort) || (newProps.patterns != this.props.patterns);
	}

	componentWillUnmount() {

	}

	componentDidUpdate() {
		// console.info('patterns collections view  did update', new Date() - this.renderDate);
		// console.info('patterns collections view  did update2', new Date() - this.renderDate2);
		if(!this.props.fullView) {
			//console.log('patternCollection did update');
			this.refs.container.scrollTop = 0;
			let parent = $(this.refs.container);
			console.debug(__visibleNumber);
			if(__visibleNumber < 5) {
				let placeHolders = generatePlaceHolder(5 - __visibleNumber);
				placeHolders.forEach((e) => {
					$(e).appendTo(parent);
				});
			}
		} else {
			$('.pattern-view.holder', this.refs.container).remove();
		}
	}

	sortData(rawData){

		let { sortType } = this.props.sort;
		//如果 sortType 没有变化那么不需要重新排序
		if(this.oldSortType === sortType) {
			return this.sortedData;
		}
		//排序
		let sortedData = rawData.concat([]) || [];

		if(sortType === '') {
			return sortedData;
		}

		let getLastDate = (pattern) => {
			return new Date(pattern.kLine[pattern.kLine.length - 1][0]);
		};

		sortedData = sortedData.sort((a,b) => { 
			switch (sortType) {
				case sortTypes.SIMILARITY:
					return  a.similarity - b.similarity;
				case sortTypes.SIMILARITY_R:
					return  b.similarity - a.similarity;
				case sortTypes.DATE:
					return  getLastDate(a) - getLastDate(b);
				case sortTypes.DATE_R:
					return  getLastDate(b) - getLastDate(a);
				case sortTypes.YIELD:
					return  a.yield - b.yield;
				case sortTypes.YIELD_R:
					return  b.yield - a.yield;
				default:
				 	return false;
			}
		});

		//缓存
		this.oldSortType = sortType;
		this.sortedData = sortedData;
		return this.sortedData;
	}

	filterTrashedId(id, isTrashed) {
		console.info(id, isTrashed, 'xxxxxxxxxx000000000000');
		_idTrashed[id] = isTrashed;
		this._debounceRedrawDc();
	}

	getPatternNodes() {
		
		let { dispatch, waitingForPatterns, fullView, active, patternTrashed } = this.props;

		let { crossFilter, rawData , error, searchConfig} = this.props.patterns;
		let { id } = active;
		let { showTrashed, showNotTrashed } = patternTrashed;

		let sortedData = this.sortData(rawData);

		let nodes = null;

		// if (waitingForPatterns) {		//正在请求

		// 	nodes = (<div><i className='fa fa-circle-o-notch fa-spin'></i>正在获取数据...</div>);

		// } else if(error) { 					//请求错误

		// 	nodes = (<div>
		// 				<h4>请求数据错误</h4>
		// 				<p>{ '' + error }</p>
		// 			</div>);

		// } else {                        //请求成功

			//如果crossFilter 是新来的
			if(this.oldCrossFilter !== crossFilter) {

				console.info('crossFilter changed!');
				this.oldCrossFilter = crossFilter;
				this.symbolDim = crossFilter.dimension(e=>{ return e.symbol; });
				this.idDim = crossFilter.dimension(d=>{ return d.id; });
			}

			let filteredData = this.symbolDim.top(Infinity),
				idArr = _.pluck(filteredData, 'id');
			
			let index = 0; //显示出来的index, -1为隐藏的
			//sortedData = sortedData.slice(0 ,5);
			let dataArr = /*this.renderLeading5*/false ? sortedData.slice(0, 5) : sortedData;
			__visibleNumber = 0;
			nodes = dataArr.map((e, i) => {
				let show = false;
				if(showNotTrashed && showTrashed) {   //查看全部
					show = idArr.indexOf(e.id) !== -1;
					show = show || _idTrashed[e.id];
				} else if (showNotTrashed && !showTrashed) { //只看未剔除
					show = idArr.indexOf(e.id) !== -1;
				} else if (!showNotTrashed && showTrashed) {  //只看剔除
					show = _idTrashed[e.id];
				}
				show && __visibleNumber++;
				let isActive = id === e.id;
				return <PatternView searchConfig={searchConfig} ref={`pattern_view_${e.id}`} filterTrashedId={this.filterTrashedId.bind(this)} id={e.id} isActive={isActive} show={show} pattern={e} key={e.id} index={ show ? index++ : -1} dispatch={dispatch} fullView={fullView}/>
			});
			//nodes = nodes.length > 0 ? nodes.slice(0,10) : [];
		//}
		// this.renderDate2 = new Date();
		return nodes;
	}

	render(){
		// this.renderDate = new Date();
		const className = classNames('pattern-collection', {'scroll-hidden': !this.props.fullView});

		return (<div ref='container' className={className}>
			{ this.getPatternNodes() }
		</div>);
	}
}

PatternCollection.propTypes = propTypes;
PatternCollection.defaultProps = defaultProps;

let stateToProps = function(state) {
	const {layout, patterns, sort, active, filter, patternTrashed} = state;
	const {stockView, patternSmallView} = layout;
	//const {crossFilter,rawData} = patterns;
	return {fullView: !stockView, patternSmallView, patterns, sort, active, filter, patternTrashed, _setIdTrashed };
};

export default connect(stateToProps)(PatternCollection);
