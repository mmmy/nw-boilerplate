import request from './request';
import querystring from 'querystring'
import config from './config';

let {searchOptions} = config;
/**
 * 搜索匹配结果metadata
 * args: {symbol, dateRange:[]}
 */

let searchPatterns = (args, cb, errorCb) => {
	console.log(searchOptions, config);
	const { symbol, dateRange } = args;
	let { path } = searchOptions;

	path = path + querystring.stringify({
		'symbol': 	symbol,
		'from': 	dateRange[0],
		'to': 		dateRange[1],
	});
	
	let options = {              
		...searchOptions,
		path
	};

	request(options, cb, errorCb);
}

module.exports = {
	searchPatterns,
};