
const accountKey = '__ACCOUNT';
const users = '__USERS_LOCAL';

let storageAccount = (username, password) => {
	window.localStorage[accountKey] = JSON.stringify({U:username, P:password});
};

let getAccount = () => {
	let obj = window.localStorage[accountKey] && JSON.parse(window.localStorage[accountKey]) || {U:'', P:''};
	return {username: obj.U, password: obj.P};
};

let removeAccount = () => {
	delete window.localStorage[accountKey];
};

let saveUser = (username, password) => {
	let storage = window.localStorage[users] || '[]';
	let storageArr = JSON.parse(storage);
	storageArr = storageArr.slice(0,9);
	for(let i=0; i<storageArr.length; i++) { //更新
		let one = storageArr[i];
		if(one.U==username) {
			one.P = password;
			window.localStorage[users] = JSON.stringify(storageArr);
			return;
		}
	}
	//添加
	storageArr.push({U:username,P:password});
	window.localStorage[users] = JSON.stringify(storageArr);
};

let removeSavedUser = (username) => {
	let storage = window.localStorage[users];
	if(storage) {
		let storageArr = JSON.parse(storage);
		for(let i=0; i<storageArr.length; i++) {
			let one = storageArr[i];
			if(one.U==username) {
				storageArr.splice(i,1);
				window.localStorage[users] = JSON.stringify(storageArr);
				return;
			}
		}
	}
};

let getAllSavedUsers = () => {
	let storage = window.localStorage[users] || '[]';
	let storageArr = JSON.parse(storage);
	return storageArr;
};

module.exports = {
	storageAccount,
	getAccount,
	removeAccount,
	saveUser,
	removeSavedUser,
	getAllSavedUsers,
};