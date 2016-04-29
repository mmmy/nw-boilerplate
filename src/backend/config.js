

export default {

	searchOptions: {
		host: 'localhost', //'192.168.0.20',
		port: 3000,
		path: '/match',
		method: 'POST',
	},

	patternOptions: {
		host: '192.168.0.20',
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

// export default {

// 	searchOptions: {
// 		host: 'localhost',
// 		port: 3000,
// 		path: '/search_pattern',
// 		method: 'GET',
// 	},

// 	patternOptions: {
// 		host: 'localhost',
// 		port: 3000,
// 		path: '/get_patterns',
// 		method: 'POST',
// 	},

// 	fileChunkOptions: {
// 		host: 'localhost',
// 		port: 3000,
// 		path: '/file_chunk',
// 		method: 'GET',
// 	}

// }