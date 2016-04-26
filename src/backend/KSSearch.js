import $ from 'jquery';
import http from 'http';
import url from 'url';
import config from './config';

/**
 * args: {symbol, dateRange:[]}
 */

const { host, protocol, patternSearchPath } = config;

let searchPatterns = (args, cb, errorCb) => {

	const { symbol, dateRange } = args;

	let searchUrl = url.format({               // http://www.xxx.com/patterns?symbol=000001.ss&from=2341412348&to=2341234123
		
		protocol,
		host,
		pathname: patternSearchPath,
		query: {
			'symbol': 	symbol,
			'from': 	dateRange[0],
			'to': 		dateRange[1],
		},

	});

	http.get(searchUrl, (res) => {

		res.on('data', (chunck) => {
			responseString += chunck.toString();
		});

		res.on('error', (e) => {
			errorCb && errorCb(e);
		});

		res.on('end', () => {
			cb && cb(responseString);
		});

	});

}

module.exports = {
	searchPatterns,
};