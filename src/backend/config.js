

export default {

	searchOptions: { 	    //搜索配置
		host: 'localhost',  //'192.168.0.20',
		port: 30020,
		path: '/match',
		method: 'POST',
	},

	patternOptions: {  	    //获取k线数据配置
		host: 'localhost',
		port: 30011,
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