var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');


app.use(express.static(__dirname));

function newUpdate(html, caret, key)
{
	return {
		html: html,
		caret: caret,
		key: key
	};
}

app.get('/(:filename)~(:extension)', function(req, res) {
	res.sendFile(__dirname + '/editor.html');

	var text ='';
	var file = '../RcodeFiles/' + req.params.filename + '.' + req.params.extension;

	fs.readFile(file, function(err, data) {
		if (err) {
			text = '';
			console.log(err);
		}
		else text = data.toString('utf8');

		fs.writeFileSync(file, text);

		io.on('connection', function(socket){
			console.log('a user connected: ', socket.id);

			io.emit('update', newUpdate(text, { begin: 0, end: 0}, 0));

			socket.on('disconnect', function() {
				console.log('user disconnected');
			});

			socket.on('update', function(update) {
				text = update.html;
				fs.writeFileSync(file, text);

				io.emit ('update', newUpdate(text, update.caret, update.key));
			});
		});
	});
});

http.listen(3000, function() {
	console.log('listening on *:3000');
});