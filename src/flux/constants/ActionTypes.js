export const TOGGLE_STOCK_VIEW = 'TOGGLE_STOCK_VIEW';
export const TOGGLE_PREDICTION_PANEL = 'TOGGLE_PREDICTION_PANEL';
export const RE_LAYOUT = 'RE_LAYOUT';

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

//错误处理
export const GET_PATTERNS_ERROR = 'GET_PATTERNS_ERROR';          //获取patterns错误

//sort
export const SORT_BY_DATE = 'SORT_BY_DATE';
export const SORT_BY_SIMILARITY = 'SORT_BY_SIMILARITY';
export const SORT_BY_YIELD = 'SORT_BY_YIELD';

export const GET_LAST_CLOSE_PRICE = 'GET_LAST_CLOSE_PRICE';
