export default {

    searchOptions: {            //鎼滅储閰嶇疆
        host: '139.196.226.133',  //'192.168.0.20',
        port: 30020,
        path: '/match',
        url: 'http://112.74.17.46:17654/match', //鏈熻揣
        // url: 'http://120.24.71.4:17654/match',  //btb
        method: 'POST',
        agent: false
    },

    patternOptions: {           //鑾峰彇k绾挎暟鎹厤缃
        host: /*'120.24.71.4',//*/'139.196.226.133',
        port: 15501,
        path: '/query',
        url: 'http://139.196.226.133:30011/query',  //鏈熻揣
        // url: 'http://120.24.71.4:15501/query',  //btb
        method: 'POST',
    },

    fileChunkOptions: {
        host: 'localhost',
        port: 3000,
        path: '/file_chunk',
        method: 'GET',
    },

    groupOptions: {
    	host: '112.74.17.46',
        port: 25501,
        path: '/groups',
        url: 'http://139.196.226.133:30011/groups',
        method: 'GET'
    },

    symbolListOptions: {
        host: "http://139.196.226.133",
        port: 25501,
        path: "querysymbols",
        url: "http://139.196.226.133:30011/querysymbols",
        method: "POST"
    },

	loginOptions: {
		url: 'http://112.74.17.46:30030/api/login',
		method: 'POST'
	},

	logoutOptions: {
		url: 'http://112.74.17.46:30030/api/logout',
		method: 'POST'
	},
}
