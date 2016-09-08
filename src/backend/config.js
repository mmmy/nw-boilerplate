

export default {

	searchOptions: { 	    //搜索配置
		host: '120.24.71.4',  //'192.168.0.20',
		port: 17654,
		path: '/match',
		url: 'http://112.74.17.46:17654/match',//'http://120.24.71.4:17654/match',
		method: 'POST',
		agent: false
	},

	patternOptions: {  	    //获取k线数据配置
		host: /*'120.24.71.4',//*/'112.74.17.175',
		port: 15501,
		path: '/query',
		url: 'http://112.74.17.46:25501/query', //'http://120.24.71.4:15501/query',
		method: 'POST',
	},

    groupOptions: {
    	host: '112.74.17.46',
        port: 25501,
        path: '/groups',
        url: 'http://112.74.17.46:25501/groups',
        method: 'GET'
    },

	fileChunkOptions: {
		host: 'localhost',
		port: 3000,
		path: '/file_chunk',
		method: 'GET',
	},

    symbolListOptions: {
        host: "http://112.74.17.46",
        port: 25501,
        path: "querysymbols",
        url: "http://112.74.17.46:25501/querysymbols",
        method: "POST"
    }
}
