import request from './request';
import querystring from 'querystring'
import config from './config';
import url from 'url';

let { fileChunkOptions } = config;

/**
 * 获取文件chuck
 */

let getFileChunk = (fileName, cb, errorCb) => {

	let { path } = fileChunkOptions;

	path = url.format({
		pathname: path, 
		query:{
			filename: fileName
		}
	});

	let options = {
		...fileChunkOptions,
		path,
	}

	let callback = (resStr) => {

		//[[date, open, close, low, high]]
		let data = resStr.split('\n').map((str) => {
			return str.split(',');
		});

		cb && cb(data);
	};

	request(options, callback, errorCb);

};

module.exports = {
	getFileChunk,
};