import request from './request';
import config from './config';
import KSChunk from './KSChunk';

let { patternOptions} = config;

/**
 * 获取股票具体数据
 * args: {symbol, dateRange:[]}
 */

const { dataHost, dataPort, protocol, patternSearchPath } = config;

let postSymbolData = (args, cb, errorCb) => {

	const { symbol, dateRange } = args;

	let options = {           		
		...patternOptions
	};

	let postData = querystring.stringify({
		'symbol': symbol,
		'from':   dateRange[0],
		'to': 	  dateRange[1],
	});

	let dataCb = (resStr) => {
		
		try {
			
			let resObj = JSON.parse();
			//TODO:获取文件chunk, 并合并数据
			let data = {};
			cb && cb(data);

		} catch (e) {
			errorCb(e);
		}

	};

	request(options, cb, errorCb, postData);
}

module.exports = {
	postSymbolData,
};