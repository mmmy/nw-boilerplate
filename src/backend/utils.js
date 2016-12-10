import moment from 'moment';
import fs from 'fs';
import path from 'path';

let getDaysDuration = (d1, d2) => {
	
	let duration = moment.duration(moment(d2) - moment(d1));
	return duration.days();

};

//kLine = [['2012-1-2', open, close, low, high]]
let calcYieldRate = (kLine, baseBars=1) => {

	if (Object.prototype.toString.call(kLine) !== '[object Array]') {
		console.error('kLine must be a array');
		return 0;
	}

	if (baseBars >= kLine.length ) {
		console.info("kLine's length is shorter than baseBars !");
		return 0;
	}

	const closePriceIndex = 2;

	let basePrice = kLine[baseBars -1][closePriceIndex],
		lastPrice = kLine[kLine.length -1][closePriceIndex];

	let yieldRate = (lastPrice - basePrice) / basePrice;

	return yieldRate;

};

let readFolder = (pathName) => {
	try{
		return fs.readdirSync(pathName);
	} catch(e) {
		console.error(e);
		return;
	}
};

let dateFormatter = (date) => {
	let dilimeter = '-';
	return {
		toMonth: date.getFullYear() + dilimeter + (date.getMonth() + 1),
		day: date.getDate()
	};
};

let saveFile = (pathName, string) => {
	try {
		fs.writeFileSync(pathName, string);
	} catch (e) {
		console.error(e);
	}
};

var deleteFolderRecursive = function(pathName) {
  if( fs.existsSync(pathName) ) {
    fs.readdirSync(pathName).forEach(function(file,index){
      var curPath = path.join(pathName, file);
      if(fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(pathName);
  }
};

let removeDir = (pathName, cb) => {
	try {
		deleteFolderRecursive(pathName);
		cb && cb(null, 'ok')
	} catch (e) {
		cb && cb(e);
	}
};

let deleteFile = (pathName, cb) => {
	fs.unlink(pathName, cb);
};

let readFileSync = (pathName) => {
	try {
		return fs.readFileSync(pathName);
	} catch(e) {
		console.error(e);
	}
};

module.exports = {
	getDaysDuration,
	calcYieldRate,
	readFolder,
	dateFormatter,
	saveFile,
	removeDir,
	deleteFile,
	readFileSync,
};