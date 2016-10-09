
import fs from 'fs';
import path from 'path';
import { readFolder, dateFormatter, saveFile, deleteFile } from './utils';
import { showSuccessMessage } from '../ksControllers/messager';

const BASEPATH = '../storage';
const FAVORITES = 'favorites';
const _favoritesPath = path.join(BASEPATH, FAVORITES);
const _defaultFilePath = path.join(BASEPATH, FAVORITES, '0.json');

let _favoritesData = {}; //{'12213.json':{name:'aaa',data:[]}}

let _createFavoritesFolder = () => {
	try{
		if (!fs.existsSync(BASEPATH)) {
			fs.mkdirSync(BASEPATH);
		}
		if (!fs.existsSync(_favoritesPath)) {
			fs.mkdirSync(_favoritesPath);
			let initData = {name:'默认',data:[]};
			fs.writeFileSync(_defaultFilePath, JSON.stringify(initData));
		}
	} catch(e) { console.error(e); }
};

let _loadLatestData = () => {
	let keys = Object.keys(_favoritesData);

	keys.forEach((fileName) => {
			let raw = fs.readFileSync(path.join(_favoritesPath, fileName));
			try{
				let data = JSON.parse(raw);
				_favoritesData[fileName] = data;
			}catch(e) {
				console.error(e);
			}
		});
};

let _getFileByName = (name) => {
	let keys = Object.keys(_favoritesData);
	for(let i=0; i<keys.length; i++) {
		let item = _favoritesData[keys[i]];
		if(item && (item.name == name)) {
			return keys[i];
		}
	}
	console.warn('no match');
};

let getAllDataFromStorage = () => {
	//初始化目录结构
	_createFavoritesFolder();
	
	let files = readFolder(_favoritesPath);
	//解析目录文件结构
	files.forEach((name) => {
		let pathName = path.join(_favoritesPath, name);
		if(fs.lstatSync(pathName).isFile()) {
			_favoritesData[name] = null;
		}
	});

	//加载最数据
	_loadLatestData();
};

let addNewClass = (name) => {
	let time = new Date().getTime();
	let fileName = time + '.json';
	let initData = {name:name, data:[]};
	_favoritesData[fileName] = initData
	saveFile(path.join(_favoritesPath, fileName), JSON.stringify(initData));
	return {fileName, initData};
};

let addFavorites = (name, dataObj, cb) => {

	let fileName = _getFileByName(name);
	if(!fileName) {
		return;
	}
	dataObj.edited = true;
	let target = _favoritesData[fileName];
	target.data.unshift(dataObj);
	let filePath = path.join(_favoritesPath, fileName);
	try {
		saveFile(filePath, JSON.stringify(target));
		cb && cb(null);
		showSuccessMessage('收藏成功!');
	} catch (e) {
		console.error(e);
		cb && cb(e);
	}

};

let getFavoritesList = () => {
	let keys = Object.keys(_favoritesData) || [];
	keys.sort((a, b) => {
		return new Date(parseInt(a)) - new Date(parseInt(b));
	});
	let dataArr = keys.map((fileName) => {
		return _favoritesData[fileName];
	});
	return {
		filesName:keys,
		dataArray: dataArr
	};
};

let getFavoritesFolders = () => {
	let keys = Object.keys(_favoritesData) || [];
	keys.sort((a, b) => {
		return new Date(parseInt(a)) - new Date(parseInt(b));
	});
	let folders = keys.map((fileName) => {
		return _favoritesData[fileName].name;
	});
	return folders;
};

let _getNameByData = (dataObj) => {
	let keys = Object.keys(_favoritesData) || [];
	let len = keys.length;
	for(let i=0; i<len; i++) {
		let key = keys[i];
		let data = _favoritesData[key].data;
		if(data.some((e)=>{ return e==dataObj; })) {
			return	_favoritesData[key].name;
		}
	}
	return '';
};

let deleteOneFavorite = (name, dataObj, clean) => { //clean: bool, true: 永久删除
	name = name || _getNameByData(dataObj);
	let fileName = _getFileByName(name);
	let state = dataObj.state || {isTrashed:true, trashDate:null};
	state.isTrashed = true;
	state.trashDate = new Date();
	dataObj.state = state;
	let data = _favoritesData[fileName];
	if(clean) { //永久删除
		let dataArr = data && data.data;
		let index = dataArr.indexOf(dataObj);
		dataArr.splice(index, 1);
	}
	let filePath = path.join(_favoritesPath, fileName);
	saveFile(filePath, JSON.stringify(data));
};

let deleteFavorites = (fileName, cb) => {
	delete _favoritesData[fileName];
	deleteFile(path.join(_favoritesPath, fileName), cb);
};

let recoverOneFavorite = (dataObj) => {
	let state = dataObj.state;
	if(!state) {
		return	false;
	}
	state.isTrashed = false;
	dataObj.state = state;
	return true;
};

let updateFavorites = (name, dataObj, showMessage) => {
	name = name || _getNameByData(dataObj);
	try {
		let fileName = _getFileByName(name);
		let data = _favoritesData[fileName];
		let dataArr = data && data.data;
		let index = dataArr.indexOf(dataObj);
		let filePath = path.join(_favoritesPath, fileName);
		saveFile(filePath, JSON.stringify(data));
		showMessage && showSuccessMessage('保存成功!');
		return true;
	} catch (e) {
		console.error(e);
		return false;
	}
};

let renameFavorites = (name, newName) => {
	let allNames = getFavoritesFolders() || [];
	if(allNames.indexOf(newName) > -1) {		//已有相同文件名
		return false;
	}
	try {
		let fileName = _getFileByName(name);
		if(!fileName) {
			return false;
		}
		let data = _favoritesData[fileName];
		data.name = newName;
		let filePath = path.join(_favoritesPath, fileName);
		saveFile(filePath, JSON.stringify(data));
		return	true;
	} catch(e) {
		console.error(e);
		return false;
	}
};

let getTrashedData = () => {
	let keys = Object.keys(_favoritesData) || [];
	let trashedArr = [];
	keys.forEach((key)=>{
		let dataArr = _favoritesData[key].data || [];
		dataArr.forEach((dataObj) => {
			let state = dataObj.state || {};
			if(state.isTrashed) {
				trashedArr.push(dataObj);
			}
		});
	});
	return trashedArr;
};

let getTrashedDataLength = () => {
	return getTrashedData().length;
};

let clearTrashedFavorites = () => {
	let favorites = getTrashedData();
	try {
		favorites.forEach((favorite) => {
			deleteOneFavorite(null, favorite, true);
		});
		return true;
	} catch(e) {
		console.error(e);
	}
};

module.exports = {
	getAllDataFromStorage,
	addNewClass,
	addFavorites,
	getFavoritesList,
	getFavoritesFolders,
	deleteFavorites,
	deleteOneFavorite,
	updateFavorites,
	renameFavorites,
	recoverOneFavorite,
	getTrashedData,
	getTrashedDataLength,
	clearTrashedFavorites,
};
