import * as types from '../constants/ActionTypes';

let getPatternSmallView = function() {
	return false;
	//return window.innerWidth < 1000;
}

const initialState = {
	stockView: false, 							               //主stock view 视图
	patternSmallView: getPatternSmallView(),     //patterns 一列 or 两列 视图
	waitingForPatterns: false, 					         //等待 getPatterns 返回结果
  	isPredictionShow: true,                      // 走势预测面板显示
	searchTimeSpent: 0, 						             //毫秒
}

export default function layout(state = initialState, action) {

	switch (action.type) {

		case types.TOGGLE_STOCK_VIEW: //切换主视图
			return {
				...state,
				stockView: !state.stockView
			};

    case types.TOGGLE_PREDICTION_PANEL: // 走势预测面板显示
      return {
        ...state,
        isPredictionShow: !state.isPredictionShow
      };

		case types.RE_LAYOUT:        //重新布局, 暂时没有用到
			let patternSmallView = getPatternSmallView();
			if (state.patternSmallView == patternSmallView) return state;
			return {
				...state,
				patternSmallView
			};

		case types.WAITING_PATTERNS:    //开始等待搜索结果
			return {
				...state,
				waitingForPatterns: true,
			};

		case types.CHANGE_PATTERNS:    //搜索结束
			let {searchTimeSpent} = action;
			return {
				...state,
				waitingForPatterns: false,
				searchTimeSpent,
			};

		case types.GET_PATTERNS_ERROR: //搜索错误
			return {
				...state,
				waitingForPatterns: false
			};

		default:
			return state;

	}
}
