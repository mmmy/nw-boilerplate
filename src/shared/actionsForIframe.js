import { patternActions, layoutActions, tradingViewActions } from '../flux/actions';
import fs from 'fs';
import { cancelSearch } from '../backend';

export default function(store) {

	const searchSymbolDateRange = function(args, cb) {
		if (store && store.dispatch) {
			store.dispatch(layoutActions.waitingForPatterns());                //开始等待
      store.dispatch(patternActions.resetError());
			store.dispatch(patternActions.getPatterns(args, cb)); //从服务器获取patterns
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

  const recalculateHeatmap = function() {

        let heatmapYAxis = Math.abs(window.eChart.getOption().yAxis[0].max) + Math.abs(window.eChart.getOption().yAxis[0].min);
        let scaleMinValue = Math.abs(window.eChart.getOption().yAxis[0].min);
        let eachBlockValue = Math.round(Math.sqrt(heatmapYAxis)); // 根据振幅幅度划分每一个小格的容量
        let eachValueInPercentage = eachBlockValue / heatmapYAxis;
        let blocksNumber = Math.round(1 / eachValueInPercentage);
        let yAxisData = [];

        let height = window.heatmap.getHeight();
        let eachBlockHeight = height / blocksNumber;

        let min = 0;
        for (let i = 0; i < blocksNumber; i++) {
          yAxisData.push(min + ':' + (min += eachBlockHeight));
        }

        let lastPrices = window.parent.eChart.getOption().series.map((serie, idx) => {
          return serie.data[serie.data.length - 1];
        });

        lastPrices.sort((a, b) => {return a - b}); // sort numerically
        let bunch = lastPrices;

        let eChartSeriesData = [];

        for (let idx = 0; idx < yAxisData.length; idx++) {
          let range = yAxisData[idx].split(':');
          let count = 0;
          for (let i = 0; i < bunch.length; i++) {
            let value = bunch[i];
            let position = (value + Math.abs(scaleMinValue)) / heatmapYAxis * height;

            if (position > range[0] && position <= range[1]) count = i + 1;
          }
          eChartSeriesData.push([0, idx, count])
          bunch = bunch.slice(count);
          count = 0;
        }
        let option = window.heatmap.getOption();
        option.yAxis[0].data = yAxisData;
        option.series[0].data = eChartSeriesData;

        window.heatmap.setOption(option, true);
  }

	window.actionsForIframe = {
		searchSymbolDateRange,      //tv-chart.html 中 "搜索"
		sendSymbolHistory,          //获取股票数据
    sendSymbolSearchResult,
    takeScreenshot,
    showConfigModal,
    scrollToOffsetAnimated,
    searchCancel,
    updatePaneViews,
    recalculateHeatmap
	};
}
