import { combineReducers } from 'redux';
import layout from './layout';
import statistics from './statistics';
import partterns from './partterns';


export default combineReducers({
	layout,
	statistics,
	partterns,
});