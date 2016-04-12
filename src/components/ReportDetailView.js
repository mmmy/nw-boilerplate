import React, { PropTypes } from 'react';
import classNames from 'classnames';

const propTypes = {
	report: PropTypes.object.isRequired,
};

const defaultProps = {
  
};

class ReportDetailView extends React.Component {

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

	generateItem(title='搜索结果', items = [{name:'样本数', content:'35.32%'}]){
		return (<div>
			<h6 style={{textAlign:'center',fontWeight:'bold'}}>{title}</h6>
			<div className='flex-container'>
				{items.map((e, i) => {
					return (<div key={i}>
							<div>{e.name}</div>
							<div>{e.content}</div>
						</div>);
				})}
			</div>
		</div>);
	}

	render(){
		let className = classNames('reportdetail-container');
		return (<div className={className}>
			<div className='report-item result-item0'>
				{this.generateItem()}
			</div>
			<div className='report-item result-item1'>
				{this.generateItem()}
			</div>
			<div className='report-item result-item2'>
				{this.generateItem()}
			</div>
		</div>);
	}
}

ReportDetailView.propTypes = propTypes;
ReportDetailView.defaultProps = defaultProps;

export default ReportDetailView;