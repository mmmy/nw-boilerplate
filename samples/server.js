var http = require('http');
var url = require('url');
var fs = require('fs');
var querystring = require('querystring');

var searchPatterns = '/match',
	getPatterns = '/get_patterns',
	fileChunk = '/file_chunk';

var PORT = 3000;

var server = http.createServer(function(req, res){

	var urlObj = url.parse(req.url);
	var queryObj = querystring.parse(urlObj.query);

	console.log(urlObj);
	console.log(queryObj);

	var pathname = urlObj.pathname;

	switch (pathname) {

		case searchPatterns:
			res.writeHead(200, {
                'Content-Type': 'text/plain'
            });
            var resStr = fs.readFileSync('./search_pattern', 'utf8');
            res.write(resStr);
            res.end();
            break;

        case getPatterns:
        	res.writeHead(200, {
        		'Content-Type': 'text/plain'
        	});
        	var resStr = fs.readFileSync('./get_patterns', 'utf8');
        	res.write(resStr);
        	res.end();
        	break;

        case fileChunk:
        	res.writeHead(200, {
        		'Content-Type': 'text/plain'
        	});
        	var filename = queryObj.filename;
        	var resStr = fs.readFileSync('./chunks/' + filename, 'utf8');
        	res.write(resStr);
        	res.end();
        	break;

        default:
        	res.writeHead(404, {
        		'Content-Type': 'text/plain'
        	});
        	res.write('404 Not found');
        	res.end();
        	break;
	}

});

server.listen(PORT, function(){
	console.log('server on port '+PORT);
});