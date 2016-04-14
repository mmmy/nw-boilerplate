import { patternActions, layoutActions } from '../flux/actions';

export default function(store) {
	
	var searchSymbolDateRange = function(symbol, dateRange, cb) {
		if (store && store.dispatch) {
			store.dispatch(layoutActions.waitingForPatterns());                //开始等待
			store.dispatch(patternActions.getPatterns(symbol, dateRange, cb)); //从服务器获取patterns
		}
	};

	window.actionsForIframe = {
		searchSymbolDateRange,      //tv-chart.html 中 "搜索"
	};
}