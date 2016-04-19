import { combineReducers } from 'redux';
import layout from './layout';
import statistics from './statistics';
import patterns from './patterns';
import report from './report';
import filter from './filter';
import comparatorTv from './comparatorTv';


export default combineReducers({
	layout,
	statistics,
	patterns,
	report,
	filter,
  comparatorTv,
});
