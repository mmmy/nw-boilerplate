import * as types from '../constants/ActionTypes';

let getPatternSmallView = function() {
	return false;
	//return window.innerWidth < 1000;
}

const initialState = {
	stockView: false, 							               //主stock view 视图 // 弃用2016-08-30
	patternSmallView: getPatternSmallView(),     //patterns 一列 or 两列 视图
	waitingForPatterns: false,//(process.env.NODE_ENV !== 'development'), 	//等待 getPatterns 返回结果 //弃用2016-08-30
	firstStart: true,
  isPredictionShow: true,                      // 走势预测面板显示
	searchTimeSpent: 0, 						             //毫秒
  hasNewScreenshot: false,
  screenshotTvURL: '',
  screenshotEChartURL: '',
}

export default function layout(state = initialState, action) {

	switch (action.type) {
		// case types.BEFORE_TOGGLE_STOCK_VIEW: //切换主视图之前的动画
		// 	return state;

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
				firstStart: false,
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

    case types.TAKE_SCREENSHOT:
    let { screenshotTvURL, screenshotEChartURL, screenshotHeatmapURL } = action;
      return {
        ...state,
        hasNewScreenshot: true,
        screenshotTvURL,
        screenshotEChartURL,
        screenshotHeatmapURL

      };

    case types.RENDER_SCREENSHOT:
      return {
        ...state,
        hasNewScreenshot: false
      };

    case types.SET_USER:
    	let {username} = action;
    	if(username === ''){
    		return {
    			...state,
    			// stockView: true,
    			// waitingForPatterns: true,
    			firstStart: true,
    		};
    	} else {
    		return state;
    	}

		default:
			return state;

	}
}
