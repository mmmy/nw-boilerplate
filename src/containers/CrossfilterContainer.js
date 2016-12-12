import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import CrossfilterView from '../components/CrossfilterView';

const propTypes = {

};

const defaultProps = {
  
};

class CrossfilterContainer extends React.Component {

	constructor(props) {
		super(props);
		this.state = {};
		this._isLight = $ && $.keyStone && ($.keyStone.theme == 'light');
	}

	componentDidMount() {
		/**
		 * add toggl btn
		 */
		let that = this;
		let isLight = this._isLight;
		let $toggleBtn = $(`<button class="flat-btn toggle-crossfilter"><img src="image/keshihua${isLight ? '' : '_white'}.png"/>可视化统计</button>`)
											.click(function(event) {
												/* Act on the event */
												$(that.refs.root).toggleClass('show');
											});
		$(this.refs.root).append($toggleBtn);
	}

	componentWillReceiveProps(){

	}

	shouldComponentUpdate(){
		return true;
	}

	componentWillUnmount(){

	}

	render(){
		let { dispatch, fullView, crossFilter } = this.props;
		let className = classNames('crossfilter-out-container transition-position');
		return (<div ref='root' className={ className }>
				<div className='title-container'>
					<h3 className='title'>可视化统计</h3>
				</div>
				<div className='crossfilter-wrapper'>
					<CrossfilterView 
						dispatch={dispatch}
						crossFilter={crossFilter}
						stretchView={fullView}
					/>
				</div>
			</div>);
	}
}

CrossfilterContainer.propTypes = propTypes;
CrossfilterContainer.defaultProps = defaultProps;

let stateToProps = function(state) {
	let crossFilter = state.patternsAsync.crossFilter,
			fullView = !state.layout.stockView;
	return {
		crossFilter,
		fullView
	};
};

export default connect(stateToProps)(CrossfilterContainer);