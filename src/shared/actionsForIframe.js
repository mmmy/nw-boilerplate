import { patternActions, layoutActions, tradingViewActions } from '../flux/actions';
import fs from 'fs';
import { cancelSearch } from '../backend';

export default function(store) {

	const searchSymbolDateRange = function({symbol, dateRange, bars}, cb) {
		if (store && store.dispatch) {
			store.dispatch(layoutActions.waitingForPatterns());                //开始等待
      store.dispatch(patternActions.resetError());
			store.dispatch(patternActions.getPatterns({symbol, dateRange, bars}, cb)); //从服务器获取patterns
		}
	};

  const sendSymbolHistory = function(postData, cb) {
    tradingViewActions.getSymbolHistory(postData, cb);
  };

  const sendSymbolSearchResult = function(postData, cb) {
    tradingViewActions.getSymbolSearchResult(postData, cb);
  };

  const showConfigModal = function() {
    store.dispatch(layoutActions.showConfigModal());
  };

  const takeScreenshot = function() {
      const chartDom = window.widget_comparator._innerWindow();
      const tvChartUrl = chartDom.Q5.getAll()[0]._paneWidgets[0].canvas.toDataURL();
      const predictionUrl = window.eChart.getDataURL();
      const heatmapUrl = window.heatmap.getDataURL();

      store.dispatch({
        type: 'TAKE_SCREENSHOT',
        screenshotTvURL: tvChartUrl,
        screenshotEChartURL: predictionUrl,
        screenshotHeatmapURL: heatmapUrl
      });
  }

  const scrollToOffsetAnimated = function() {
    let widget = window.widget_comparator._innerWindow();
    let chart = widget.Q5.getAll()[0];

    const animationDuration = 1E3;

    if (window._oldTimeScaleRightOffset) {
      chart.model().timeScale().scrollToOffsetAnimated(window._oldTimeScaleRightOffset, animationDuration);
      setTimeout(() => {
        window.widget_comparator._innerWindow().KeyStone.kscale();
      }, animationDuration + 300)
    }
  }

  const _saveScreenshot = function(dataURL, path) {
    var regex = /^data:.+\/(.+);base64,(.*)$/;
    var matches = dataURL.match(regex);
    var ext = matches[1];
    var data = matches[2];
    var buffer = new Buffer(data, 'base64');

    fs.writeFile(path + '.' + ext, buffer, function(err){
      if (err) throw err;
      store.dispatch({
        type: 'TAKE_SCREENSHOT'
      });
      console.log('screenshot taken, rerender...');
    });
  }

  const searchCancel = function() {
    cancelSearch();
  }

  const updatePaneViews = function() {
    if (window.widget_comparator
      && window.widget_comparator._innerWindow
      && window.widget_comparator._innerWindow().Q5) {
        window.widget_comparator._innerWindow().Q5.getAll()[0].model().mainSeries().priceScale().updatePaneViews();
    }
  }

	window.actionsForIframe = {
		searchSymbolDateRange,      //tv-chart.html 中 "搜索"
		sendSymbolHistory,          //获取股票数据
    sendSymbolSearchResult,
    takeScreenshot,
    showConfigModal,
    scrollToOffsetAnimated,
    searchCancel,
    updatePaneViews
	};
}
