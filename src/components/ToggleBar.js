import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { layoutActions, patternActions } from '../flux/actions';

const propTypes = {
	dispatch: PropTypes.func.isRequired,
	fullView: PropTypes.bool,
};

const defaultProps = {

};

class ToggleBar extends React.Component {

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

		let {fullView, searchTimeSpent} = this.props;
		
		const toggleClass = classNames('container-toggle', {
			'full': fullView
		});

		const btnClass = classNames('item', 'btn-toggle', {
			'rotate': fullView
		});

		const time = (searchTimeSpent/1000).toFixed(3);

		return (<div className={toggleClass}>
					<div className="btn-container">
						<div className="item title">云搜索</div>
						<div className="item timespent">{ `用时:${time}秒` }</div>
						<div className={btnClass} onClick={this.toggleView.bind(this)}><i className="fa fa-angle-up"></i></div>
					</div>
		          {/*<button
		            style={{'marginLeft':'48%'}}
		            className="btn btn-default btn-sm"
		            onClick={this.toggleView.bind(this)}>云搜索</button>
		          <button
		            className="btn btn-default btn-sm"
		            onClick={this.getPatterns.bind(this)}>获取数据
		          </button>*/}
        		</div>);
	}

	toggleView() {
		this.props.dispatch(layoutActions.toggleStockView());
	}

	getPatterns() {
		this.props.dispatch(patternActions.getPatterns());
	}
}

ToggleBar.propTypes = propTypes;
ToggleBar.defaultProps = defaultProps;

export default ToggleBar;