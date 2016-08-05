

export default {

	searchOptions: { 	    //搜索配置
		host: '112.74.17.175',  //'192.168.0.20',
		port: 17654,
		path: '/match',
		url: 'http://112.74.17.175:17654/match',
		method: 'POST',
		agent: false
	},

	patternOptions: {  	    //获取k线数据配置
		host: '120.24.71.4',//'112.74.17.175',
		port: 15501,
		path: '/query',
		url: 'http://112.74.17.175:15501/query',
		method: 'POST',
	},

	fileChunkOptions: {
		host: 'localhost',
		port: 3000,
		path: '/file_chunk',
		method: 'GET',
	}

}