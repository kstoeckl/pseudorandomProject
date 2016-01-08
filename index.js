/*This code was modified from the tutorial on 
http://socket.io/get-started/chat/


Need to rename, remove magic nums, comment
and generally improve code layout.

*/
var express = require('express')();
var http = require('http');
var https = require('https');
var server = http.Server(express);
var io = require('socket.io')(server);
var exec = require('child_process').execFile;

var seedLength=10;
var outputBase=10;
var freq=Array.apply(null, Array(outputBase)).map(Number.prototype.valueOf,0);;
var total=0;
var charArray=Array(seedLength);

express.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
	console.log('a user connected');
	console.log('seedLength: '+ seedLength);
  	socket.on('input', function manipulate(input){
  		processInput(input);
    });
    socket.on('wiki',function(data){
    	//used callback here due to the asyncronous nature of requests
    	function pageExtractor(callback){
	    	req = https.request('https://en.wikipedia.org/wiki/Special:Random', (res) => {
	    		console.log(res.headers.location);
	    		callback(res.headers.location);
			});
			req.end();

			req.on('error', (e) => {
				console.error(e);
			});
		}
		pageExtractor(function(url){
			req = https.request(url, (res) => {
			    console.log('statusCode: ', res.statusCode);
			    res.setEncoding('utf8');
			    //Used to avoid overflow as
			    var overflowcount=0;
			  	res.on('data', (d) => {
		  			d.split('').some(function(input){
		  				//Severely reduces performance
		  				//io.emit('input', input);
		  				processInput(input);
		  				if(overflowcount>=20000){
			  				return true;
			  			}
			  			overflowcount++;
		  			});
			  	});
			});
			req.end();

			req.on('error', (e) => {
				console.error(e);
			});
		});
    });
});

server.listen(3000, function(){
	console.log('listening on *:3000');
});
function processInput(input){
	charArray[total%seedLength] = input;
	total++;
	if (total%seedLength==0){
		var args = [charArray.join('')];
		//console.log(args);
		exec('randgen.exe',args,function( error, stdout, stderr){
	        if ( error != null ) {
	            console.error(stderr);
	        }
			//console.log("aaa: "+stdout.toString());
			io.emit('output', stdout);
			stdout.toString().split('').forEach(function(num){
				freq[num]++;
				//console.log(num);
			})
			io.emit('graph',freq);
		});
	}

}