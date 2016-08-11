import request from './request';
import querystring from 'querystring';
import url from 'url';
import config from './config';

let {searchOptions} = config;
/**
 * 搜索匹配结果metadata
 * args: {symbol, dateRange:[] }
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

//symbol:'Shenzhen:000001.SZ';
let searchPattern = ({ symbol, dateRange, bars, additionDate, searchLenMax, dataCategory }, cb, errorCb) => {
	
	let exchangeReg = /.*\:/ ; //匹配开始到冒号的所有字符, 
	//let id = parseInt(symbol.replace(exchangeReg, '')); //去掉交易所字符
	let id = symbol.replace(exchangeReg, ''); //去掉交易所字符
	
	//console.assert(!isNaN(id), 'error: 股票id  为NaN');
	console.assert(dateRange.length == 2);
	console.assert(bars > 0);
	//console.log(searchOptions, config);
	// let { path } = searchOptions;

	// path = url.format({
	// 	pathname: path, 
	// 	query:{
	// 		'symbol': 	symbol,
	// 		'from': 	dateRange[0],
	// 		'to': 		dateRange[1],
	// 	}
	// });
	
	let options = {              
		...searchOptions,
	};

	let callback = (resStr) => {
		
		try {
			let resObj = JSON.parse(resStr);
			//TODO: 处理resObj
			let dataObj = resObj;
			console.info('++++++++++++++++++++++++++++++++++', resObj);
			cb && cb(dataObj);
		} catch (e) {
			errorCb(e);
		}
	};

	let postObj = {
		mid:"test example",
		pattern:{
			id: id + '',     //后台要求是字符串 
			begin:{time: new Date(dateRange[0]).toISOString()},
			end:{time: new Date(dateRange[1]).toISOString()},
			len:bars,
		},
		dataGroupId: dataCategory,
		samples:[],
		topN: searchLenMax,
		nLookForward: parseInt(additionDate.value),
	};

	let postData = JSON.stringify(postObj);
	console.log(postData);
	return request(options, callback, errorCb, postData);
}

module.exports = {
	searchPattern,
};