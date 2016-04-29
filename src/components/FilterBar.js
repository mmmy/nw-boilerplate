import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { filterActions } from '../flux/actions';
import DC from 'dc';
import ReactInputRange from 'react-input-range';
import RCSlider from 'rc-slider';

const propTypes = {
	dispatch: PropTypes.func.isRequired,
	crossFilter: PropTypes.object.isRequired,
};

const defaultProps = {
  
};

class FilterBar extends React.Component {

	constructor(props) {
		super(props);
		this.state = {showRange:false, values:{min:0, max:100}};
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
		let rangeClass = classNames('inputrange-container', {'hide': !this.state.showRange});
		let {min, max} = this.state.values;
		return (<div className="filterbar-container">
				<div className='toolbar-item item0'>
					<div className='input-group input-group-flatten'>
						<input type='text' ref='symbol' className='form-control input-sm' onFocus={()=>{console.log('input onFocus')}} onBlur={e=>{console.log('input onBlur')}}/>
						<span className='input-group-btn'>
							<button className="btn btn-default btn-sm" type="button" onClick={this.handleFilterSymbol.bind(this)} onFocus={()=>{console.log('btn onFocus')}} onBlur={e=>{console.log('btn onBlur')}}><i className='fa fa-search'></i></button>
						</span> 
					</div>
				</div>
				<div className='toolbar-item item1'>
					{<span className='title-left' >相似度:</span>}
					{/*<div className='wrapper'><ReactInputRange maxValue={100} minValue={0} value={this.state.values} onChange={this.rangeChange.bind(this)} onChangeComplete={this.rangeChangeComplete.bind(this)}/></div>*/}
					<div className='slider-container'>
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
					{/*<button className="btn btn-default btn-sm" onFocus={this.showRange.bind(this)} onBlur={this.hideRange.bind(this)}>
						{`相似度${min}%-${max}%`}
						<span className='caret'></span>
						<div className={rangeClass}><div className='wrapper'><ReactInputRange maxValue={100} minValue={0} value={this.state.values} onChange={this.rangeChange.bind(this)} onChangeComplete={this.rangeChangeComplete.bind(this)}/></div></div>
					</button>*/}
				</div>
			</div>);
	}

	initDimensions() {

		let {crossFilter} = this.props;
		if(this.oldCrossFilter !== crossFilter) {
			this.symbolDim = crossFilter.dimension(function(d){ return d.symbol });
			this.similarityDim = crossFilter.dimension(function(d) {return Math.round(d.similarity*100); });
			this.oldCrossFilter = crossFilter;
		}
	}

	handleFilterSymbol() {

		let symbol=this.refs.symbol.value;

		this.filterSymbol(symbol);
		this.props.dispatch(filterActions.setFilterSymbol(symbol));

	}

	filterSymbol(symbol){

		this.initDimensions();

		this.symbolDim.filter(function(d){ return d.indexOf(symbol) >=0; });

		DC.redrawAll();
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

	showRange() {
		this.setState({showRange: true});
	}

	hideRange() {
		this.setState({showRange: false});
	}

	rangeChange(range){
		this.setState({values:{min:range[0], max:range[1]}});
	}

	rangeChangeComplete(range){
		console.log('rangeChangeComplete');
		this.handleFilterSimilarity();
	}

}

FilterBar.propTypes = propTypes;
FilterBar.defaultProps = defaultProps;

export default FilterBar;