import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { filterActions } from '../flux/actions';
import DC from 'dc';


const propTypes = {
	dispatch: PropTypes.func.isRequired,
	crossFilter: PropTypes.object.isRequired,
};

const defaultProps = {
  
};

class FilterBar extends React.Component {

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
		return (<div className="filterbar-container">
				<div className='input-group'>
					<input type='text' ref='symbol' className='form-control input-sm' />
					<span className='input-group-btn'>
						<button className="btn btn-default" type="button" onClick={this.handleFilter.bind(this)}>Go!</button>
					</span> 
				</div>
			</div>);
	}

	handleFilter() {

		let symbol=this.refs.symbol.value;

		this.filterSymbol(symbol);
		this.props.dispatch(filterActions.setFilterSymbol(symbol));

	}

	filterSymbol(symbol){

		let {crossFilter} = this.props;

		if(this.oldCrossFilter !== crossFilter) {
			this.symbolDim = crossFilter.dimension(function(d){ return d.symbol });
			this.oldCrossFilter = crossFilter;
		}

		this.symbolDim.filter(function(d){ return d.indexOf(symbol) >=0; });

		DC.redrawAll();
	}
}

FilterBar.propTypes = propTypes;
FilterBar.defaultProps = defaultProps;

export default FilterBar;