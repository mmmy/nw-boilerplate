import utils from './utils';
import path from 'path';
import fs from 'fs';

const BASEPATH = '../storage';
const WATCHLIST = 'watchlist';

const _watchlistPath = path.join(BASEPATH, WATCHLIST);

let _generateFileName = (category='default') => { //分组
	const file = `watchlist_${category}.json`;
	return path.join(_watchlistPath, file);
}

let _createFolderes = (category) => {
	var firstTime = false;
	var filePath = _generateFileName(category);
	try{
		if (!fs.existsSync(BASEPATH)) {
			fs.mkdirSync(BASEPATH);
		}
		if (!fs.existsSync(_watchlistPath)) {
			fs.mkdirSync(_watchlistPath);
		}
		if (!fs.existsSync(filePath)) {
			firstTime = true;
			/*
			var now = new Date();
			var defaultData = {
													list:[
																{
																	symbolInfo:{
																		symbol: '000001.SH',
																		ticker: '上证综合指数',
																		type: 'index',
																		exchange: '',
																		instrument: '',  //记录期货的主力合约
																	}
																},{
																	symbolInfo:{
																		symbol: '399106.SZ',
																		ticker: '深证综合指数',
																		type: 'index',
																		exchange: '',
																		instrument: '',
																	}
																}
													],
													resolution: 'D',
													baseBars: 30,
													searchConfig: {
															additionDate: {type:'days', value:7},
															searchSpace: '000010',
															dateRange: [{date:'1990/01/01', hour:'0', minute:'0', second:'0'}, {date:`${now.getFullYear()}/${now.getMonth()+1}/${now.getDate()}`, hour:'23', minute:'59', second:'59'}],
															isLatestDate: true,
															similarityThreshold: {value: 0.6, on:false},
															spaceDefinition: { stock: true, future: false },
															matchType: '形态',
															searchLenMax: 200
													}
												};
			utils.saveFile(filePath, JSON.stringify(defaultData));
			*/
		}
	} catch(e) { console.error(e); }
	return firstTime;
};

let getDataFromStorage = (category='default') => {
	var firstTime = _createFolderes(category);
	if(firstTime) {
		return null;
	} else {
		var dataStr = utils.readFileSync(_generateFileName(category));
		return JSON.parse(dataStr);
	}
}

let saveToFile = (dataObj, category='default') => {
	try {
		utils.saveFile(_generateFileName(category), JSON.stringify(dataObj));
	} catch(e) {
		console.error(e);
	}
}

module.exports = {
	getDataFromStorage,
	saveToFile,
};
