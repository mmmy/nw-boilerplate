
import fs from 'fs';
import path from 'path';
import { readFolder, dateFormatter, saveFile, deleteFile } from './utils';

const BASEPATH = './storage';
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

let addFavorites = (name, dataObj) => {

	let fileName = _getFileByName(name);
	if(!fileName) {
		return;
	}
	let target = _favoritesData[fileName];
	target.data.unshift(dataObj);
	let filePath = path.join(_favoritesPath, fileName);
	saveFile(filePath, JSON.stringify(target));

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

let deleteOneFavorite = (name, dataObj) => {
	let fileName = _getFileByName(name);
	let data = _favoritesData[fileName];
	let dataArr = data && data.data;
	let index = dataArr.indexOf(dataObj);
	dataArr.splice(index, 1);
	let filePath = path.join(_favoritesPath, fileName);
	saveFile(filePath, JSON.stringify(data));
};

let deleteFavorites = (fileName, cb) => {
	delete _favoritesData[fileName];
	deleteFile(path.join(_favoritesPath, fileName), cb);
};

let updateFavorites = (name, dataObj) => {
	try {
		let fileName = _getFileByName(name);
		let data = _favoritesData[fileName];
		let dataArr = data && data.data;
		let index = dataArr.indexOf(dataObj);
		let filePath = path.join(_favoritesPath, fileName);
		saveFile(filePath, JSON.stringify(data));
		return true;
	} catch (e) {
		console.error(e);
		return false;
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
};
