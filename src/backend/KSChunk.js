import request from './request';
import querystring from 'querystring'
import config from './config';

let { fileChunkOptions } = config;

/**
 * 获取文件chuck
 */

let getFileChunk = (fileName, cb, errorCb) => {

	let path = fileChuckOptions.path + '/' + fileName;

	let options = {
		...fileChuckOptions,
		path,
	}

	request(options, cb, errorCb);

};

module.exports = {
	getFileChunk,
};