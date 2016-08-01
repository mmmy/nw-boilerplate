
import fs from 'fs';
import path from 'path';
import { readFolder, dateFormatter, saveFile, removeDir, deleteFile } from './utils';

const BASEPATH = './storage';
const HISTORY = 'history';
const _historyPath = path.join(BASEPATH, HISTORY);

let _historyData = {};

let _createHistoryFolder = () => {
	try{
		if (!fs.existsSync(BASEPATH)) {
			fs.mkdirSync(BASEPATH);
		}
		if (!fs.existsSync(_historyPath)) {
			fs.mkdirSync(_historyPath);
		}
	} catch(e) { console.error(e); }
};

let _loadLatestData = (days) => {
	let keys = Object.keys(_historyData);
	keys.sort((a, b) => { return new Date(b) - new Date(a)});
	keys.slice(0, 1000).forEach((folderName) => {
		let filesSet = _historyData[folderName];
		let fileKeys = Object.keys(filesSet);
		fileKeys.forEach((file) => {
			let raw = fs.readFileSync(path.join(_historyPath, folderName, file));
			try{
				let data = JSON.parse(raw);
				_historyData[folderName][file] = data;
			}catch(e) {
				console.error(e);
			}
		});
	});
};

let getAllFilesFromStorage = () => {
	//初始化目录结构
	_createHistoryFolder();
	
	let yearFolders = readFolder(_historyPath);
	//解析目录文件结构
	if(yearFolders) {
		yearFolders.forEach((name) => {
			let pathName = path.join(_historyPath, name);
			if(fs.lstatSync(pathName).isDirectory()) {
				let files = readFolder(pathName); //arr
				_historyData[name] = files && files.reduce((pre, cur) => {
					pre[cur] = null;
					return pre;
				}, {} );
			}
		});
	}
	//加载最数据
	_loadLatestData();
};

let deleteHistory = (year, month, day) => {
	let toMonth = year + '-' + month;
	if(day) {
		console.warn('unlink file !');
	} else {
		removeDir(path.join(_historyPath, toMonth), (error, data) => {
			if(error){
				console.error(error);
			} else {
				delete _historyData[toMonth];
			}
		});
	}
};

let pushHistory = (dataObj) => {
	let d1 = new Date();
	let { toMonth, day } = dateFormatter(new Date());
	let fileName = day + '.json';
	let thisMonthFliles = _historyData[toMonth] || {};
	let todayData = thisMonthFliles[fileName] || { data:[] };
	todayData.data.push(dataObj);
	thisMonthFliles[fileName] = todayData;

	if(!fs.existsSync(path.join(_historyPath, toMonth))) {
		fs.mkdirSync(path.join(_historyPath, toMonth));
	}

	let filePath = path.join(_historyPath, toMonth, fileName);
	saveFile(filePath, JSON.stringify(todayData));
	console.debug('pushHistory timeoused:', new Date() - d1);
};

let updateStorage = () => {

};

let getHistoryData = (dateRange) => {
	return _historyData;
};

let getSortedHistoryMonth = () => {
	let keys = Object.keys(_historyData);
	keys.sort((a, b) => { return new Date(b) - new Date(a)});
	return keys;
};

let getSortedMonthData = (yearMonth) => {
	let monthData = _historyData[yearMonth];
	let result = {yearMonth, keys:[], data:null};
	if(monthData) {
		let keys = Object.keys(monthData);
		keys.sort((a, b) => {
			return parseInt(b) - parseInt(a);
		});
		result.keys = keys;
		result.data = monthData;
	}
	return result;
};

module.exports = {
	getAllFilesFromStorage,
	deleteHistory,
	pushHistory,
	updateStorage,
	getHistoryData,
	getSortedHistoryMonth,
	getSortedMonthData
};