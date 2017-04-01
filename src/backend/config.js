
var DOMAIN = 'http://service.stone.io';
    // DOMAIN = '120.24.71.4';

let getURL = function(port, path) {
    return `${DOMAIN}:${port}/${path}`;
};

export default {

    searchOptions: {            //搜索
        url: getURL(30020, 'match'),
        // url: 'http://139.196.226.133:30020/match', //stock, Future
        // url: 'http://112.74.17.46:17654/match', //stock, Future
        // url: 'http://120.24.71.4:17654/match',  //btb
        // url: 'http://192.168.0.102:17654/match',  //USDJPY
        method: 'POST',
        agent: false
    },

    patternOptions: {           //数据
        url: getURL(30011, 'query'),
        // url: 'http://139.196.226.133:30011/query',  //stock, Future
        // url: 'http://112.74.17.46:25501/query',  //stock, Future
        // url: 'http://192.168.0.102:35501/query',  //stock, Future
        // url: 'http://120.24.71.4:15501/query',  //btb
        // url: 'http://192.168.0.102:15501/query',  //USDJPY
        method: 'POST',
    },

    fileChunkOptions: {
        method: 'GET',
    },

    groupOptions: {
        url: getURL(30011, 'groups'),
        // url: 'http://139.196.226.133:30011/groups',
        // url: 'http://112.74.17.46:25501/groups',
        // url: 'http://120.24.71.4:15501/groups',
        method: 'GET'
    },

    dataTimeOptions: {
        url: getURL(30011, 'querydatatime'),
        // url: 'http://139.196.226.133:30011/groups',
        // url: 'http://112.74.17.46:25501/groups',
        method: 'POST'
    },

    symbolListOptions: {
        url: getURL(30011, 'querysymbols'),
        // url: "http://139.196.226.133:30011/querysymbols",
        // url: "http://112.74.17.46:25501/querysymbols",
        method: "POST"
    },

	loginOptions: {
        url: getURL(30030, 'api/login'),
		// url: 'http://112.74.17.46:30030/api/login',
		method: 'POST'
	},

	logoutOptions: {
        url: getURL(30030, 'api/logout'),
        // url: 'http://112.74.17.46:30030/api/logout',
        method: 'POST'
    },

    signOptions: {
        url: getURL(30030, 'api/signup'),
        // url: 'http://112.74.17.46:30030/api/signup',
		url: 'http://localhost:3000/api/signup',
		method: 'POST'
	},
    validateOptions: {
        url: getURL(30030, 'api/validate'),
        url: 'http://localhost:3000/api/validate',

        method: 'POST'
    },
    resetPasswordOptions: {
        url: getURL(30030, 'api/reset_password'),
        url: 'http://localhost:3000/api/reset_password',

        method: 'POST'
    },
    changePasswordOptions: {
        url: getURL(30030, 'api/change_password'),
        url: 'http://localhost:3000/api/change_password',

        method: 'POST'
    },

    //本期扫描
    scannerOptions: {
        url: getURL(30054, 'scan'),
        // url: 'http://192.168.0.102:40054/scan',
        method: 'GET',
    },
    //扫描是否更新
    scannerDateOptions: {
        url: getURL(30054, 'newest'),
        // url: 'http://192.168.0.102:40054/newest',
        method: 'GET',
    },
    //获取扫描往期列表
    scannerListOptions: {
        url: getURL(30054, 'oldscanlist'),
        // url: 'http://139.129.11.35:40054/oldscanlist',
        // url: 'http://192.168.0.106:40054/oldscanlist',
        method: 'GET',
    },
    //获取往期数据
    scannerQueryOptions: function(date) {
        return {
            url: getURL(30054, 'scanbydate') + '/' + date,
            // url: 'http://139.129.11.35:40054/scanbydate/' + date,
            // url: 'http://192.168.0.106:40054/scanbydate/' + date,
            method: 'GET',
        }
    },
}
