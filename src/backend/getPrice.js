
import request from './request';
import config from './config';
var { dataTimeOptions, patternOptions } = config;

var queryDataTime = function(symbol, dataCategory, endTime, dataCallBack, errorCb) {
	var postObj = {
		batchCondition: [
			{
				dataCategory: dataCategory,
				id: symbol,
				end: endTime.toISOString(),
			}
		]
	};
	var options = {
		...dataTimeOptions
	};
	var postData = JSON.stringify(postObj);
	//test local 
	// if(window.actionsForIframe.mockQueryDataTime) {
	// 	window.actionsForIframe.mockQueryDataTime(options, dataCallBack, errorCb, postData);
	// }
	return request(options, dataCallBack, errorCb, postData);
}

var getLatestTime = function(symbolInfo, resolution, endTime, dataCallBack, errorCb) {
	var symbol = symbolInfo.symbol;
	var dataCategory = 'cs_m1';
	if(symbolInfo.type.toLowerCase() == 'futures') {
		dataCategory = 'cf_m5';
	}
	let cb = function(resStr) {
		var dataTime = JSON.parse(resStr);
		// console.log(dataTime);
		var latestTime = new Date(dataTime.batchTimeResult[0].end);
		dataCallBack({latestTime});
	}
	queryDataTime(symbol, dataCategory, endTime, cb, errorCb);
}

/*给watchlist 使用 获取实时价格(天数据或分钟数据), 股票,期货,通用,
	symbolInfo: {
		ticker:'',
		symbol:'000001.SH',
		type:'futures',
	}
--------------------------------------*/
var getLatestPrice = function(symbolInfo, resolution, dataCallBack, errorCb, options) {
	let isDay = options && options.isDay;
	var dataCategory = isDay ? 'cs' : 'cs_m1';
	if(symbolInfo.type.toLowerCase() == 'futures') {
		dataCategory = isDay ? 'cf' : 'cf_m5';
	}
	var symbol = symbolInfo.symbol;
	var now = new Date();
	var endTime = now + 10 * 60 * 1000; //往后10分钟
	var endTimeIOS = (new Date(endTime)).toISOString();
	var xhr = queryDataTime(
					symbol,
					dataCategory,
					now,
					function(resStr){
						var dataTime = JSON.parse(resStr);
						// console.log(dataTime);
						var lastestTime = new Date(dataTime.batchTimeResult[0].end);
						//分钟级别的 和 天级别的 往前的时间不一样
						var startTimeISO = (new Date(lastestTime - (isDay ? 1440 * 10 : 15) * 60 * 1000)).toISOString();
						//获取K线数据
						var postObj = {
							batchCondition: [
								{
									dataCategory: dataCategory,
									id: symbol,
									begin: startTimeISO,
									end: endTimeIOS,
								}
							]
						};
						var postData = JSON.stringify(postObj);
						var succesCb = function(resStr) {
							var resObj = JSON.parse(resStr);
							var adjfactor1 = resObj.batchDataSet[0].metaData.adjfactor;
							var chunks = resObj.batchDataSet[0].chunks;
							var records = chunks[0].records;
							//至少要两个bar, 才能计算出涨跌
							if(records.length<2) {
								console.warn('not enough record', symbolInfo, options);
							}
							if(records.length>1) {
								var lastTwo = records.slice(-2);
								var lastArr = lastTwo.map(function(record){
									var adjfactor = record.adjfactor;
									var priceObj = {
										dateTime: record.datetime,
										volume: record.volume,
										amount: record.amount,
										open: record.open * adjfactor / adjfactor1,
										close: record.close * adjfactor / adjfactor1,
										low: record.low * adjfactor / adjfactor1,
										high: record.high * adjfactor / adjfactor1,
									};
									return priceObj;
								});
								dataCallBack(lastArr);
							}
						};

						request(patternOptions, succesCb, errorCb, postData);
					},
					function(err){
						errorCb(err);
					}
				);
};
/* 获取上一天的收盘价格, 用来计算涨跌幅
------------------------------ */
var getLastDayPrice = function() {

}
/* 从sina获取实时价格
----------------------------------- */
var getPriceFromSina = function(symbolInfo, resolution, dataCallBack, errorCb) {
	// if(!/\./.test(symbolInfo.symbol)) {     //'000001.SH'
	// 	console.warn(symbolInfo.symbol, 'has no exchange!');
	// }
	var isF = symbolInfo.type == 'futures';
	var isFF = false; //金融期货
	var list0 = '';//sina接口的格式
	if(isF) {
		if(!symbolInfo.instrument) {
			console.warn('合约呢!?',symbolInfo);
		}
		var instrument = symbolInfo.instrument || '';
		//判断是否为金融期货, 需要加CFF_
		isFF = ['ic','if','ih','t','tf'].indexOf(symbolInfo.symbol.toLowerCase()) > -1;
		list0 = (isFF ? 'CFF_' : '') + instrument.toUpperCase();
	} else {
		var symbols = symbolInfo.symbol.split('.');
		list0 = symbols[1].toLowerCase() + symbols[0];      //sh000001
	}
	var url = `http://hq.sinajs.cn/list=${list0}`;
	var method = "GET";
	var cb = function(resStr) {
		//股票:open:1 close:3 high:4 low:5 lastClose:2
		//期货:open:2 close:8 high:3 low:4 lastClose:10(昨日结算价) volume:13
		//金融期货:open:0 close:3 high:1 low:2 lastClose:14
		var sS = resStr.split(',');
		if(sS.length > 1) {
			dataCallBack([{
				open: parseFloat(sS[isF ? (isFF ? 0:2):1]),
				close: parseFloat(sS[isF ? (isFF ? 3:8):3]),
				high: parseFloat(sS[isF ? (isFF ? 1:3):4]),
				low: parseFloat(sS[isF ? (isFF ? 2:4):5]),
				lastClose: parseFloat(sS[isF ? (isFF ? 14:10):2])
			}]);
		} else {
			dataCallBack([]);
		}
	}

	request({url,method}, cb, errorCb);
}

module.exports = {
	getLatestTime,
	getLatestPrice,
	getPriceFromSina
};
