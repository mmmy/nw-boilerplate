export const TOGGLE_STOCK_VIEW = 'TOGGLE_STOCK_VIEW';
export const TOGGLE_PREDICTION_PANEL = 'TOGGLE_PREDICTION_PANEL';
export const RE_LAYOUT = 'RE_LAYOUT';
export const TAKE_SCREENSHOT = 'TAKE_SCREENSHOT';
export const RENDER_SCREENSHOT = 'RENDER_SCREENSHOT';

export const WAITING_PATTERNS = 'WAITING_PATTERNS';        //开始等待后台返回结果
export const CHANGE_REPORT = 'CHANGE_REPORT';   			//设置patterns, 一般是从后台返回的数据
export const CHANGE_STATISTICS = 'CHANGE_STATISTICS';
export const CHANGE_PATTERNS = 'CHANGE_PATTERNS';

export const ADD_PATTERNS = 'ADD_PATTERNS';
export const FILTER_PATTERNS = 'FILTER_PATTERNS';
export const SORT_PATTERNS = 'SORT_PATTERNS';

export const SET_FILTER_INDUSTRY = 'SET_FILTER_INDUSTRY';     //filter行业
export const SET_FILTER_YIELDRANGE = 'SET_FILTER_YIELDRANGE'; 		//filter收益率
export const SET_FILTER_SYMBOL = 'SET_FILTER_SYMBOL';           //symbol filter
export const SET_FILTER_SIMILARITY = 'SET_FILTER_SIMILARITY';   //相似度范围过滤
export const SET_FILTER_YIELDDATERANGE = 'SET_FILTER_YIELDDATERANGE';   //时间范围过滤
export const SET_FILTER_ID = 'SET_FILTER_ID';

//错误处理
export const GET_PATTERNS_ERROR = 'GET_PATTERNS_ERROR';          //获取patterns错误
export const RESET_ERROR = 'RESET_ERROR';

//sort
export const SORT_BY_DATE = 'SORT_BY_DATE';
export const SORT_BY_SIMILARITY = 'SORT_BY_SIMILARITY';
export const SORT_BY_YIELD = 'SORT_BY_YIELD';

 // 预测曲线
export const SET_LAST_CLOSE_PRICE = 'SET_LAST_CLOSE_PRICE';
export const SET_ALL_PREDICTION_LAST_CLOSE_PRICES = 'SET_ALL_PREDICTION_LAST_CLOSE_PRICES';
export const SET_PREDICTION_PRICE_SCALE_MARKS = 'SET_PREDICTION_PRICE_SCALE_MARKS';
export const SET_HEATMAP_YAXIS = 'SET_HEATMAP_YAXIS';

//active
export const SET_ACTIVE_ID = 'SET_ACTIVE_ID';

//config modal
export const SHOW_CONFIG_MODAL = 'SHOW_CONFIG_MODAL';
export const CLOSE_CONFIG_MODAL = 'CLOSE_CONFIG_MODAL';

export const SET_SEARCH_CONFIG = 'SET_SEARCH_CONFIG';

//
export const SET_PATTERN_TRASH_LAYOUT = 'SET_PATTERN_TRASH_LAYOUT';

//用户
export const SET_USER = 'SET_USER';
