import request from './request';
import config from './config';
import KSFileService from './KSFileService';
import querystring from 'querystring';
import path from 'path';
import moment from 'moment';
import { calcYieldRate } from './utils';

let { patternOptions } = config;

/**
 * 将获取文件后的chunk整合为kline数据
 * @param  {[type]} chunks [description]
 * @return {[type]}        [description]
 */
let chunksToKline = (chunks, metaAdj) => {
	
	let klineData = [];
	
	chunks.map((chunk, i) => {
		
		let type = chunk.type;
		let chunkKline = [];

		if(type === 'RecordChunk' || type === undefined) {
			
			chunkKline = chunk.records.map((record) => {
				let { datetime, open, close, low, high, volume, adjfactor=1 } = record;
				return [datetime, open*adjfactor/metaAdj, close*adjfactor/metaAdj, low*adjfactor/metaAdj, high*adjfactor/metaAdj, volume];
			});
			
		} else {
			
			chunkKline = chunk.data;
		}

		klineData = klineData.concat(chunkKline);        

	});
	
	return klineData;

};

/**
 * 获取股票具体数据
 * args: [{symbol, dateRange:[]},]
 */

let postSymbolData = (startIndex, args, bars, cb, errorCb) => {

	let options = {           		
		...patternOptions
	};

	let batchCondition = args.map(({symbol, dateRange, lastDate, timeUnit='d', dataCategory='cs', additionDate = { type:'days', value: 30 } }) => {
		lastDate = typeof lastDate === 'string' ? lastDate : lastDate.time;
		let begin = moment.utc(dateRange[0]).add(-1, 'seconds').toISOString();
		let end = lastDate && moment.utc(lastDate).add(1, 'seconds').toISOString() || moment.utc(dateRange[1]).add(additionDate.value, additionDate.type).toISOString();
		return {
			dataCategory: dataCategory,
			dataTimeUnit: timeUnit,
			id: symbol,
			begin: begin,
	    end: end
		};
	});

	let postObj = {
		batchCondition
	};

	// let postData = querystring.stringify({
	// 	'pt': args.map(({symbol, dateRange}) => { return path.join('/', symbol, ''+dateRange[0], ''+dateRange[1]); })
	// });
	let postData = JSON.stringify(postObj);
	// console.log('--------------------------------------', postData);

	let dataCb = (resStr) => {
		
		try {
			
			let resObj = JSON.parse(resStr);
			let batchDataSet = resObj.batchDataSet;
			const dataSetLen = batchDataSet.length;

			let mergeData = () => {

				let klineArr = resObj.batchDataSet.map(({metaData, chunks}) => {
					let metaAdj = metaData.adjfactor || 1;
					let kLine = chunksToKline(chunks, metaAdj);  //k线数据
					let yieldRate = calcYieldRate(kLine, bars);

					return {
						metaData,
						kLine,
						yieldRate,
					};

				});

				cb && cb(startIndex, klineArr);
			};
			//TODO:获取文件chunk, 并合并数据
			let fileChunkCount = 0;
			batchDataSet.forEach((e, i) => {
				e.chunks.forEach((chunkObj, j) => {
					if (chunkObj.type === 'LocalFileChunk') {
						fileChunkCount += 1;
						let { filename } = chunkObj;
						KSFileService.getFileChunk(filename, (data) => {
							chunkObj.data = data;
							fileChunkCount -= 1;
							if(fileChunkCount === 0) {
								// console.log('got all chunks');
								mergeData();
							}
						}, errorCb);
					}
				});
			});	
			if (fileChunkCount === 0) {
				mergeData();
			}
			//let data = resObj;
			//cb && cb(data);

		} catch (e) {
			errorCb(e);
		}

	};

	return request(options, dataCb, errorCb, postData);
}

module.exports = {
	postSymbolData,
};