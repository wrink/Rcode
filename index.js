var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');


app.use(express.static(__dirname));

var text;
var file = 'file.txt';

//change 0
function newUpdate(html, caret, key)
{
	return {
		html: html,
		caret: caret,
		key: key
	};
}

fs.readFile(file, function(err, data) {
	if (err) {
		text = '';
		console.log(err);
	}
	else text = data.toString('utf8');

	fs.writeFileSync(file, text);

	app.get('/', function(req, res) {
		res.sendFile(__dirname + '/editor.html');
	});
	app.get('/(:id)', function(req, res) {
		res.sendFile(__dirname + '/editor.html');
	});

	io.on('connection', function(socket){
		console.log('a user connected: ', socket.id);

		//change 1
		io.emit('update', newUpdate(toHTML(text), { begin: 0, end: 0}, 0));

		socket.on('disconnect', function() {
  		  console.log('user disconnected');
  		});

  		socket.on('update', function(update) {
  			//change 2
  			text = update.html;
  			fs.writeFileSync(file, text);

  			//change 3
  			io.emit ('update', newUpdate(toHTML(text), update.caret, update.key));
  		});
	});


	http.listen(3000, function() {
		console.log('listening on *:3000');
	});
});


/*
 * Escape all special charactersin html
 * Use BEFORE formatting
 * 
 * @param	{String} html
 * @return	{String}
 */
function toHTML (html) {
	return String(html)
	.replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}