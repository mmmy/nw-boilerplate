import React, { PropTypes } from 'react';
import PatternView from './PatternView';
import _ from 'underscore';
const propTypes = {
	patterns: PropTypes.object.isRequired,
	dispatch: PropTypes.func.isRequired,
	fullView: PropTypes.bool.isRequired
};

const defaultProps = {
  	
};

//note 重要: crossfilter 生成的dimensions数量不能超过128个 , 所以要注意保存dimension !!

class PatternCollection extends React.Component {

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

	getPatternNodes() {
		
		let { dispatch, waitingForPatterns } = this.props;
		let { crossFilter, rawData , error} = this.props.patterns;

		let nodes = null;

		if (waitingForPatterns) {		//正在请求

			nodes = (<div><i className='fa fa-circle-o-notch fa-spin'></i>正在获取数据...</div>);

		} else if(error) { 					//请求错误

			nodes = (<div>
						<h4>请求数据错误</h4>
						<p>{ '' + error }</p>
					</div>);

		} else {                        //请求成功

			//如果crossFilter 是新来的
			if(this.oldCrossFilter != crossFilter) {

				console.info('crossFilter changed!');
				this.oldCrossFilter = crossFilter;
				this.symbolDim = crossFilter.dimension(e=>{ return e.symbol; });
				
			}

			let filteredData = this.symbolDim.top(Infinity),
				idArr = _.pluck(filteredData, 'id');
			
			nodes = rawData.map((e, i) => {
				let show = idArr.indexOf(e.id) != -1;
				return <PatternView show={show} pattern={e} key={i} index={i} dispatch={dispatch}/>
			});

		}

		return nodes;
	}

	render(){
		

		return (<div className="pattern-collection">
			{ this.getPatternNodes() }
		</div>);
	}
}

PatternCollection.propTypes = propTypes;
PatternCollection.defaultProps = defaultProps;

export default PatternCollection;