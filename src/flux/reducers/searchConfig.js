import * as types from '../constants/ActionTypes';
import { SPACE_DEFINITION, MATCH_TYPE } from '../constants/Const';
var gui = window.require('nw.gui');

var now = new Date();

var initialState = {
	additionDate: {type:'days', value:7},
	searchSpace: '000010',
	dateRange: [{date:'1990/01/01', hour:'0', minute:'0', second:'0'}, {date:`${now.getFullYear()}/${now.getMonth()+1}/${now.getDate()}`, hour:'23', minute:'59', second:'59'}],
	isLatestDate: true,
	dateThreshold: {value: 0.3, on: true},        //排除所选图形相同时间区间
	similarityThreshold: {value: 0.6, on: true},
	vsimilarityThreshold: {value: 0.6, on: true},
	spaceDefinition: { stock: true, future: false },
	matchType: MATCH_TYPE.MORPHO,
	searchLenMax: 200
};

var fs = require('fs');
var dir = process.platform == 'darwin' ? (gui.App.dataPath+'/searchConfig') : '../searchConfig';
try {
	fs.mkdirSync(dir);
} catch(e) {
	console.log(e);
}

var searchConfigFilePath = dir + '/searchConfigFilePath.json';
try {
    var sC = JSON.parse(fs.readFileSync(searchConfigFilePath).toString());
    for (let x in initialState) {
    	initialState[x] = sC[x] || initialState[x];
    }
} catch(e) {
    console.log(e);
}

export default function searchConfig(state=initialState, action) {
	switch(action.type) {
		
		case types.SET_SEARCH_CONFIG:
			let { searchConfig } = action;
			try {
				fs.writeFileSync(searchConfigFilePath, JSON.stringify(searchConfig));	
			} catch (e) {
				console.log(e);
			}
			return searchConfig;

		default: 
			return state;
	}
}