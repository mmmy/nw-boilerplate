import request from './request';
import config from './config';
import KSChunk from './KSChunk';
import querystring from 'querystring';
import path from 'path';
/**
 * 将获取文件后的chunk整合为kline数据
 * @param  {[type]} chunks [description]
 * @return {[type]}        [description]
 */
let chunksToKline = (chunks) => {
	
	let klineData = [];
	
	chunks.map((chunk, i) => {
		
		let type = chunk.type;
		let chunkKline = [];

		if(type === 'RecordChunk') {
			
			chunkKline = chunk.records.map((record) => {
				let { datetime, open, close, low, high } = record;
				return [datetime, open, close, low, high];
			});
			
		} else {
			
			chunkKline = chunk.data;
		}

		klineData = klineData.concat(chunkKline);        

	});
	
	return klineData;

};

let { patternOptions } = config;

/**
 * 获取股票具体数据
 * args: [{symbol, dateRange:[]},]
 */

let postSymbolData = (args, cb, errorCb) => {

	let options = {           		
		...patternOptions
	};

	let postData = querystring.stringify({
		'pt': args.map(({symbol, dateRange}) => { return path.join('/', symbol, ''+dateRange[0], ''+dateRange[1]); })
	});
	console.log(postData);

	let dataCb = (resStr) => {
		
		try {
			
			let resObj = JSON.parse(resStr);
			let batchdataset = resObj.batchdataset;
			const dataSetLen = batchdataset.length;

			let mergeData = () => {

				let klineArr = resObj.batchdataset.map(({metaData, chunks}) => {

					let data = chunksToKline(chunks);

					return {
						metaData,
						data
					};

				});

				cb && cb(klineArr);
			};
			//TODO:获取文件chunk, 并合并数据
			let fileChunkCount = 0;
			batchdataset.forEach((e, i) => {
				e.chunks.forEach((chunkObj, j) => {
					if (chunkObj.type === 'LocalFileChunk') {
						fileChunkCount += 1;
						let { filename } = chunkObj;
						KSChunk.getFileChunk(filename, (data) => {
							chunkObj.data = data;
							fileChunkCount -= 1;
							if(fileChunkCount === 0) {
								console.log('got all chunks');
								mergeData();
							}
						}, errorCb);
					}
				});
			});	
					
			//let data = resObj;
			//cb && cb(data);

		} catch (e) {
			errorCb(e);
		}

	};

	request(options, dataCb, errorCb, postData);
}

module.exports = {
	postSymbolData,
};