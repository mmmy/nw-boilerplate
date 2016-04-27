import request from './request';
import querystring from 'querystring';
import url from 'url';
import config from './config';

let {searchOptions} = config;
/**
 * 搜索匹配结果metadata
 * args: {symbol, dateRange:[]}
 */

/*****************
	resObj: 
	{
		"status":"OK",
		"pattern":[
			{
				"symbol":"000001.SS",
				"similarity":0.5723,
				"industry":1,
				"begin":1268323200000,
				"end":1299859200000,
				"type":"D"
			},
		]
	}

******************/

let searchPattern = (args, cb, errorCb) => {
	console.log(searchOptions, config);
	const { symbol, dateRange } = args;
	let { path } = searchOptions;

	path = url.format({
		pathname: path, 
		query:{
			'symbol': 	symbol,
			'from': 	dateRange[0],
			'to': 		dateRange[1],
		}
	});
	
	let options = {              
		...searchOptions,
		path
	};

	let callback = (resStr) => {
		
		try {
			let resObj = JSON.parse(resStr);
			//TODO: 处理resObj
			let dataObj = resObj;
			cb && cb(dataObj);
		} catch (e) {
			errorCb(e);
		}
	};

	request(options, callback, errorCb);
}

module.exports = {
	searchPattern,
};