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

		const btnWrapper = classNames('btn-container','transition-position','transition-duration2', {
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
		let title = waitingForPatterns ? '搜索' : '搜索结果';
		return (<div className={toggleClass} ref='container_toggle'>
					<div className={btnWrapper} onClick={this.toggleView.bind(this)}>
						<div className="item title">{title}</div>
						{/*<div className={timespentClass}>{ `用时:${time}秒` }</div>*/}
						<div className={btnClass} ref='btn_toggle'><span className='arrow-icon'></span></div>
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
    // if (this.props.fullView) window.actionsForIframe.takeScreenshot();
    let that = this;
    // $reportWrapper.one('transitionend', ()=>{
			that.props.dispatch(layoutActions.toggleStockView());
    // });
    // $('.container-searchreport').toggleClass('searchreport-full');
// return;
    if (!this.props.fullView) {
      // this.resizePrediction();
    } else {
      // this._doWhenSeries0Completed(() => {
      	// window.widget_comparator._innerWindow().Q5.getAll()[0].model().mainSeries().restart();
        // window.widget_comparator.setVisibleRange(window.searchingRange, '0');
      	// window._ksResizePrediction && window._ksResizePrediction(window);

      // }, 200)
    }
	}

  // resizePrediction() {
  //   var timeScale = window.widget_comparator._innerWindow().Q5.getAll()[0].model().timeScale();
  //   const info = $('#searching-info-content')[0].innerHTML;
  //   let daysCount = parseInt(info.slice(0, info.indexOf('bars')));
  //   var lastDateIndex = timeScale.visibleBars().firstBar() + daysCount - 1; // for prediction DOM width
  //   var pixel = timeScale.width() - timeScale.indexToCoordinate(lastDateIndex); //  50 => width by prediction dom margin
  //   window.eChart.getDom().parentNode.parentNode.style.width = pixel + 'px';
  //   window.eChart.resize();
  //   window.actionsForIframe.updatePaneViews();  // align both TV and prediction
  //   // window.actionsForIframe.recalculateHeatmap();
  // }

  _doWhenSeries0Completed(callback) {
    function run() {
      let chart = document[window.document.getElementsByTagName('iframe')[0].id];
      chart.Q5.getAll()[0].model().mainSeries().onCompleted().unsubscribe(null, run);
      callback()
    };

    let chart = document[window.document.getElementsByTagName('iframe')[0].id];
    chart.Q5.getAll()[0].model().mainSeries().onCompleted().subscribe(null, run);
  }

	getPatterns() {
		this.props.dispatch(patternActions.getPatterns());
	}
}

ToggleBar.propTypes = propTypes;
ToggleBar.defaultProps = defaultProps;

export default ToggleBar;
