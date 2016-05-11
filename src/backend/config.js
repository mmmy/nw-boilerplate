

export default {

	searchOptions: { 	    //搜索配置
		host: '112.74.17.175',  //'192.168.0.20',
		port: 17654,
		path: '/match',
		method: 'POST',
	},

	patternOptions: {  	    //获取k线数据配置
		host: '112.74.17.175',
		port: 15501,
		path: '/query',
		method: 'POST',
	},

	fileChunkOptions: {
		host: 'localhost',
		port: 3000,
		path: '/file_chunk',
		method: 'GET',
	}

}