import { combineReducers } from 'redux';
import layout from './layout';
import statistics from './statistics';
import patterns from './patterns';
import report from './report';
import filter from './filter';
import sort from './sort';
import comparatorTv from './comparatorTv';
import prediction from './prediction';
import active from './active';
import searchConfig from './searchConfig';
import configModal from './configModal';
import patternTrashed from './patternTrashed';

export default combineReducers({
	layout,
	statistics,
	patterns,
	report,
	filter,
	sort,
	comparatorTv,
	prediction,
	active,
	searchConfig,
	configModal,
	patternTrashed,
});
