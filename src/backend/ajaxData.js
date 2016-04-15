import $ from 'jquery';
import http from 'http';
import config from './config';
import { randomPartterns } from '../flux/util/randomKline';

/**
 * args: {symbol, dateRange}
 */

let getPatterns = (args, cb, errorCb) => { 
	/**********************
	let responseString = '';

	http.get('', (res) => {

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
	********************/

	//test
	setTimeout(()=>{

		let patterns = {
			"rawData": randomPartterns(200)
		};

		Math.random() > 0.5 ? (cb(JSON.stringify(patterns))) : (errorCb && errorCb('error test '+ new Date()));

	},1000);
};

module.exports = {
	getPatterns,
};