import { patternActions, layoutActions, tradingViewActions } from '../flux/actions';
import fs from 'fs';

export default function(store) {

	let searchSymbolDateRange = function({symbol, dateRange, bars}, cb) {
		if (store && store.dispatch) {
			store.dispatch(layoutActions.waitingForPatterns());                //开始等待
			store.dispatch(patternActions.getPatterns({symbol, dateRange, bars}, cb)); //从服务器获取patterns
		}
	};

  let sendSymbolHistory = function(postData, cb) {
    tradingViewActions.getSymbolHistory(postData, cb);
  }

  let sendSymbolSearchResult = function(postData, cb) {
    tradingViewActions.getSymbolSearchResult(postData, cb);
  }

  let takeScreenshot = function(canvasDom) {
      const canvasContainer = canvasDom.document.getElementsByClassName('multiple')[0];
      const canvas = canvasContainer.getElementsByTagName('canvas')[2];
      const img = canvas.toDataURL();

      var regex = /^data:.+\/(.+);base64,(.*)$/;
      var matches = img.match(regex);
      var ext = matches[1];
      var data = matches[2];
      var buffer = new Buffer(data, 'base64');

      fs.writeFile('src/image/screenshot_origin.' + ext, buffer, function(err){
        if (err) throw err;
        store.dispatch({
          type: 'TAKE_SCREENSHOT'
        });
        console.log('screenshot_origin taken, rerender...');
      });

  }

	window.actionsForIframe = {
		searchSymbolDateRange,      //tv-chart.html 中 "搜索"
		sendSymbolHistory,          //获取股票数据
    sendSymbolSearchResult,
    takeScreenshot
	};
}
