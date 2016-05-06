import { patternActions, layoutActions, tradingViewActions } from '../flux/actions';

export default function(store) {

	let searchSymbolDateRange = function({symbol, dateRange, bars}, cb) {
		if (store && store.dispatch) {
			store.dispatch(layoutActions.waitingForPatterns());                //开始等待
			store.dispatch(patternActions.getPatterns({symbol, dateRange, bars}, cb)); //从服务器获取patterns
		}
	};

  let sendSymbolHistory = function(postData, cb) {
    console.log(postData);
    tradingViewActions.getSymbolHistory(postData, cb);
  }

	window.actionsForIframe = {
		searchSymbolDateRange,      //tv-chart.html 中 "搜索"
		sendSymbolHistory,          //获取股票数据
	};
}
