import { patternActions, layoutActions, tradingViewActions } from '../flux/actions';
import fs from 'fs';
import { cancelSearch } from '../backend';

export default function(store) {

	let searchSymbolDateRange = function({symbol, dateRange, bars}, cb) {
		if (store && store.dispatch) {
			store.dispatch(layoutActions.waitingForPatterns());                //开始等待
      store.dispatch(patternActions.resetError());
			store.dispatch(patternActions.getPatterns({symbol, dateRange, bars}, cb)); //从服务器获取patterns
		}
	};

  let sendSymbolHistory = function(postData, cb) {
    tradingViewActions.getSymbolHistory(postData, cb);
  };

  let sendSymbolSearchResult = function(postData, cb) {
    tradingViewActions.getSymbolSearchResult(postData, cb);
  };

  let showConfigModal = function() {
    store.dispatch(layoutActions.showConfigModal());
  };

  let takeScreenshot = function() {
      const chartDom = window.widget_comparator._innerWindow();
      // const canvasContainer = chartDom.document.getElementsByClassName('multiple')[0];
      // const canvas = canvasContainer.getElementsByTagName('canvas')[2];
      const tvChartUrl = chartDom.Q5.getAll()[0]._paneWidgets[0].canvas.toDataURL();
      const predictionUrl = window.eChart.getDataURL();
      const heatmapUrl = window.heatmap.getDataURL();

      store.dispatch({
        type: 'TAKE_SCREENSHOT',
        screenshotTvURL: tvChartUrl,
        screenshotEChartURL: predictionUrl,
        screenshotHeatmapURL: heatmapUrl
      });

      // _saveScreenshot(tvSS, 'src/image/screenshot_origin');
      // _saveScreenshot(eChartSS, 'src/image/screenshot_prediction');
      // _saveScreenshot(heatmapSS, 'src/image/screenshot_heatmap');

      // fs.writeFile('src/image/screenshot_origin.' + ext, buffer, function(err){
      //   if (err) throw err;
      //   store.dispatch({
      //     type: 'TAKE_SCREENSHOT'
      //   });
      //   console.log('screenshot_origin taken, rerender...');
      // });
  }

  let scrollToOffsetAnimated = function() {
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

  let searchCancel = function() {
    cancelSearch();
  }

	window.actionsForIframe = {
		searchSymbolDateRange,      //tv-chart.html 中 "搜索"
		sendSymbolHistory,          //获取股票数据
    sendSymbolSearchResult,
    takeScreenshot,
    showConfigModal,
    scrollToOffsetAnimated,
    searchCancel
	};
}
