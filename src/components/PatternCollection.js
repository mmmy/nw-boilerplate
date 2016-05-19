import React, { PropTypes } from 'react';
import PatternView from './PatternView';
import * as sortTypes from '../flux/constants/SortTypes';
import _ from 'underscore';
import classNames from 'classnames';

const propTypes = {
	patterns: PropTypes.object.isRequired,
	dispatch: PropTypes.func.isRequired,
	fullView: PropTypes.bool.isRequired,
	waitingForPatterns: PropTypes.bool.isRequired,
	sort: PropTypes.object.isRequired,
	active: PropTypes.object.isRequired,
	filter: PropTypes.object,
};

const defaultProps = {
  	
};

let _nodes = [];

//note 重要: crossfilter 生成的dimensions数量不能超过128个 , 所以要注意保存dimension !!

class PatternCollection extends React.Component {

	constructor(props) {
		super(props);
		this.state = {};
	}

	componentDidMount() {

	}

	componentWillReceiveProps(newProps) { //优化性能
		// let { id } = newProps.active;
		// let oldId = this.props.active.id;
		// if(id !== this.props.active.id) {
		// 	console.log('xxxxxxxxxxxxxxxx');
		// 	$(`#pattern_view_${id}`,this.refs.container).addClass('active');
		// 	$(`#pattern_view_${oldId}`,this.refs.container).removeClass('active');
		let {crossFilter} = newProps.patterns;
		if(this.oldCrossFilter !== crossFilter) {

			console.info('crossFilter changed!');
			this.oldCrossFilter = crossFilter;
			this.symbolDim = crossFilter.dimension(e=>{ return e.symbol; });
			
		}

		if( newProps.filter !== this.props.filter ){
			
			let filteredData = this.symbolDim.top(Infinity),
					idArr = _.pluck(filteredData, 'id'),
					node = this.refs.container;
			//console.info('idarr', idArr);
			setTimeout(() => {
				$('.pattern-view', node).addClass('hide');
				idArr.forEach((id) => {
					$(`#pattern_view_${id}`,node).removeClass('hide');
				});		
			});

		}

	}

	shouldComponentUpdate(newProps, newState) {
		//return false;
		return newProps.filter === this.props.filter;   //filter更新后不进行刷新, 而是在componentWillReceiveProps 进行手动刷新
		// return (newProps.sort !== this.props.sort) || (newProps.patterns != this.props.patterns);
	}

	componentWillUnmount() {

	}

	componentDidUpdate() {
		console.log('patterns collections view  did update', new Date() - this.renderDate);
		console.log('patterns collections view  did update2', new Date() - this.renderDate2);
		if(!this.props.fullView) {
			//console.log('patternCollection did update');
			this.refs.container.scrollTop = 0;
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

	getPatternNodes() {
		
		let { dispatch, waitingForPatterns, fullView, active } = this.props;

		let { crossFilter, rawData , error} = this.props.patterns;
		let { id } = active;

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
				
			}

			let filteredData = this.symbolDim.top(Infinity),
				idArr = _.pluck(filteredData, 'id');
			
			nodes = sortedData.map((e, i) => {
				let show = idArr.indexOf(e.id) !== -1;
				let isActive = id === e.id;
				return <PatternView id={e.id} isActive={isActive} show={show} pattern={e} key={e.id} index={i} dispatch={dispatch} fullView={fullView}/>
			});
			//nodes = nodes.length > 0 ? nodes.slice(0,10) : [];
		//}
		this.renderDate2 = new Date();
		return nodes;
	}

	render(){
		
		this.renderDate = new Date();
		const className = classNames('pattern-collection', {'scroll-hidden': !this.props.fullView});

		return (<div ref='container' className={className}>
			{ this.getPatternNodes() }
		</div>);
	}
}

PatternCollection.propTypes = propTypes;
PatternCollection.defaultProps = defaultProps;

export default PatternCollection;