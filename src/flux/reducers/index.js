import { combineReducers } from 'redux';
import layout from './layout';
import statistics from './statistics';
import patterns from './patterns';
import report from './report';
import filter from './filter';
import sort from './sort';


export default combineReducers({
	layout,
	statistics,
	patterns,
	report,
	filter,
	sort,
});