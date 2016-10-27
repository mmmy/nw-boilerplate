import http from 'http';
//import concat from 'concat-stream';
//import Request from 'request';

// var postData = querystring.stringify({
//   'msg' : 'Hello World!'
// });

// var options = {
//   hostname: 'www.google.com',
//   port: 80,
//   path: '/upload',
//   method: 'POST',
//   headers: {
//     'Content-Type': 'application/x-www-form-urlencoded',
//     'Content-Length': postData.length
//   }
// };

let request = (options, cb, errorCb, postData) => {
	//使用浏览器ajax请求
	let xhr = $.ajax({
		url: options.url,
		type: options.method,
		//dataType: 'default: Intelligent Guess (Other values: xml, json, script, or html)',
		data: postData,
	})
	.done(function(data) {
		//console.log("success =======", data);
		cb && cb(data);
	})
	.fail(function(jqXHR, textStatus, errorThrown) {
		console.log("request error", errorThrown);
		if(errorThrown === 'abort') { 
			return; 
		}
		errorCb && errorCb(textStatus+errorThrown);
	})
	.always(function() {
		// console.log("complete");
	});
	
	return xhr;

	// let requestOption = {
	// 	...options,
	// 	body: postData,
	// };
	// Request(requestOption).pipe(concat((allBuffer) => {
	// 		try {
	// 			if (match) { console.info('match close event called', allBuffer); window.res =res; window.chunkAll = chunkAll; }

	// 			cb && cb(allBuffer.toString());
	// 		} catch (e) {
	// 			console.error(e);
	// 		}
	// }));
	// Request(requestOption, (error, res, body) => {
	// 	cb && cb(body);
	// });
	// return;
	

	let chunkAll = Buffer('');
	let match = /match/.test(options.path);	
	let req = http.request(options, (res) => {
		/*****************************
		console.info('is match ?', match);
		res.on('end', () => {
			if (match) { console.info('match close event called', chunkAll); }
			//setTimeout(() => {
				try {
					console.info(chunkAll.length, 'then length', res.headers['content-length']);
					cb && cb(chunkAll.toString());
				} catch (e) {
					console.error(e);
				}
		});
		res.on('data', (chunk) => {
			chunkAll += chunk;
			if (match) { console.info('on data', chunk.toString()); console.info(res); window.res = res; window.chunkAll = chunkAll; }
		});
		res.on('close', (chunk) => {
			console.info('on close');
			// chunkAll += chunk;
			// if (match) { console.info('on data', chunk.toString()); console.info(res); window.res = res; window.chunkAll = chunkAll; }
		});
		*******************/

		// res.resume();
		// res.pipe(concat((allBuffer) => {
		// 	try {
		// 		if (match) { console.info('match close event called', allBuffer); window.res =res; window.chunkAll = chunkAll; }

		// 		cb && cb(allBuffer.toString());
		// 	} catch (e) {
		// 		console.error(e);
		// 	}
		// }));
		//有bug, 有时候接收到数据但是没有触发'end'
		// res.on('readable', () => {  
		// 	var chunk = res.read();
		// 	console.log(chunk);
		// 	if (chunk === null) {
		// 		try {
		// 			console.log('request end');
		// 			cb && cb(chunkAll);
		// 		} catch (e) {
		// 			console.error(e);
		// 		}
		// 	} else {
		// 		chunkAll += chunk.toString();
		// 		res.resume();
		// 	}
		// 	if(match) {
		// 	 console.warn('on readable', chunk); 
		// 	}
		// });

		//});

		res.on('error', (e) => {
			errorCb && errorCb(e);
		});
	});

	req.on('error', (e) => {
		errorCb && errorCb(e);
	});

	req.write(postData || '');

	req.end();

};

export default request;