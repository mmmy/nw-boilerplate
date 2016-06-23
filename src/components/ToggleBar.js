import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { layoutActions, patternActions } from '../flux/actions';
import actionsForIframe from '.././shared/actionsForIframe';
import store from '../store';

const propTypes = {
	dispatch: PropTypes.func.isRequired,
	fullView: PropTypes.bool,
	waitingForPatterns: PropTypes.bool,
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

		let {fullView, searchTimeSpent, waitingForPatterns} = this.props;
		let { error } = store.getState().patterns;

		const toggleClass = classNames('container-toggle','transition-all', {
			'full': fullView,
		});

		const btnWrapper = classNames('btn-container','transition-all','transition-duration2', {
			'slide-center': waitingForPatterns,
		});

		const timespentClass = classNames('item', 'timespent', {
			'ks-hidden': waitingForPatterns
		});

		const btnClass = classNames('item', 'btn-toggle', {
			'rotate': fullView,
			'ks-hidden': waitingForPatterns || error,
			'ks-no-transition': waitingForPatterns,
		});

		const time = (searchTimeSpent/1000).toFixed(3);

		return (<div className={toggleClass} >
					<div className={btnWrapper} onClick={this.toggleView.bind(this)}>
						<div className="item title">搜索</div>
						{/*<div className={timespentClass}>{ `用时:${time}秒` }</div>*/}
						<div className={btnClass} ><i className="fa fa-angle-up"></i></div>
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
		let { waitingForPatterns } = this.props;
		let { error } = store.getState().patterns;
		if (waitingForPatterns || error) return;
    if (this.props.fullView) window.actionsForIframe.takeScreenshot();
		this.props.dispatch(layoutActions.toggleStockView());
	}

	getPatterns() {
		this.props.dispatch(patternActions.getPatterns());
	}
}

ToggleBar.propTypes = propTypes;
ToggleBar.defaultProps = defaultProps;

export default ToggleBar;
