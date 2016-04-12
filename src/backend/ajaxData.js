import $ from 'jquery';
import { randomPartterns } from '../flux/util/randomKline';

const server = '';

let getPatterns = (cb) => {

	//test
	setTimeout(()=>{

		let patterns = {
			"rawData": randomPartterns(50)
		};

		cb(JSON.stringify(patterns));

	},1000);
};

module.exports = {
	getPatterns,
};