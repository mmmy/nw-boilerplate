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
let searchPattern = ({ symbol, kline, dateRange, bars, additionDate, searchLenMax, isLatestDate, dataCategory, dr }, cb, errorCb) => {

	let exchangeReg = /.*\:/ ; //匹配开始到冒号的所有字符,
	//let id = parseInt(symbol.replace(exchangeReg, '')); //去掉交易所字符
	let id = symbol.replace(exchangeReg, ''); //去掉交易所字符

	//console.assert(!isNaN(id), 'error: 股票id  为NaN');
	// console.assert(dateRange.length == 2);
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
			// console.info('++++++++++++++++++++++++++++++++++', resObj);
			cb && cb(dataObj);
		} catch (e) {
			errorCb(e);
		}
	};

	let formatkline = (onekline) => {
		return {
			"open": onekline[1],
			"close": onekline[2],
			"low": onekline[3],
			"high": onekline[4],
			"volume": onekline[5] ? onekline[5] : 0,
		}
	};

   var sSC1=new Date(`${dr[0].date} ${dr[0].hour}:${dr[0].minute}:${dr[0].second}`).toISOString();
   var sSC2 = isLatestDate ? new Date().toISOString() : new Date(`${dr[1].date} ${dr[1].hour}:${dr[1].minute}:${dr[1].second}`).toISOString();
   /*

	try{
			sSC1 = new Date(
				parseInt(new Date(dr[0].date)*1.0) +
				1000*(
					3600*parseInt(dr[0].hour)+
					60*parseInt(dr[0].minute)+
					parseInt(dr[0].second)
				)
			).toISOString();
			sSC2 = new Date(
				parseInt(new Date(dr[1].date)*1.0) +
				1000*(
					3600*parseInt(dr[1].hour)+
					60*parseInt(dr[1].minute)+
					parseInt(dr[1].second)
				)
			).toISOString();
	} catch(e) {console.log(e)};

*/
	var klineObj = [];
	kline.forEach(function (onekline) {
		klineObj.push(formatkline(onekline));
	});
	let postObj = {
		mid:"test example",
		rangeLimit:{
			begin: {time: sSC1},
			end: {time: sSC2}
		},
		pattern:{
			//id: id + '',     //后台要求是字符串
			type: "Custom",
			data: klineObj,
			//len:bars,
		},
		dataGroupId: dataCategory,
		samples:[],
		topN: searchLenMax,
		nLookForward: parseInt(additionDate.value),
	};
	let postData = JSON.stringify(postObj);
	// console.log(postData);
	if(window.actionsForIframe.mockSearch) {
		window.actionsForIframe.mockSearch(options, callback, errorCb, postData);
		return;
	}
	return request(options, callback, errorCb, postData);
}

module.exports = {
	searchPattern,
};
