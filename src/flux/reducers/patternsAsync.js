
//patterns 的异步版本, 用于切换到第二页的时候刷新第二页面的state

import * as types from '../constants/ActionTypes';
import patterns from './patterns';

let initialState = patterns.initialState;

export default function patternsAsync(state = initialState, actions) {

	switch (actions.type) {
		case types.CHANGE_PATTERNS_ASYNC:
			return actions.patterns || [];

		default:
			return state;
	}
}