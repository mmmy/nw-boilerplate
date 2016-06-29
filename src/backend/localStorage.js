
const accountKey = '__ACCOUNT';

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

module.exports = {
	storageAccount,
	getAccount,
	removeAccount,
};