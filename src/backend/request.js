import http from 'http';

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

	let chunkAll = '';
	
	let req = http.request(options, (res) => {

		res.on('data', (chunk) => {
			chunkAll += chunk.toString();
		});

		res.on('end', () => {
			cb && cb(chunkAll);
		});

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