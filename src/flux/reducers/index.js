import { combineReducers } from 'redux';
import layout from './layout';
import statistics from './statistics';
import patterns from './patterns';
import report from './report';


export default combineReducers({
	layout,
	statistics,
	patterns,
	report
});