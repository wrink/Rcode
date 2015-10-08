var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var request = require('request');
var bodyParser = require('body-parser');
var upload = require('multer')();
var path = require('path');
var rm = require('rimraf');

var isFile = /.*\..*/i;

app.use(express.static(__dirname));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.set('view engine', 'jade');

function newUpdate(html, caret, key)
{
	return {
		html: html,
		caret: caret,
		key: key
	};
}

app.all('/', function(req, res) {
	var directory = '../RcodeFiles';
	fs.readdir(directory, function(err, files) {
		if(err) {
			console.log(err);
			return;
		}

		var content = { back: {isBack: true, name: 'Back'} };

		files.forEach(function(file) {
			content[file] = {name: file};
			if(isFile.test(file)) content[file].isFile = true;
			else content[file].isDir = true;
		});

		content["new"] = { isNew: true, name: 'New File'};
		content["trash"] = {isTrash: true, name: 'Trash'};

		res.render('directory.jade', {
			dir: directory,
			contents: content
		});
	});
});
app.post('/directory', upload.array(), function(req, res) {
	var directory = req.body.dir;
	fs.readdir(directory, function(err, files) {
		if(err) {
			console.log(err);
			return;
		}

		var content = { back: {isBack: true, name: 'Back'} };

		files.forEach(function(file) {
			content[file] = {name: file};
			if(isFile.test(file)) content[file].isFile = true;
			else content[file].isDir = true;
		});

		content["new"] = { isNew: true, name: 'New File'};
		content["trash"] = {isTrash: true, name: 'Trash'};

		res.render('directory.jade', {
			dir: directory,
			contents: content
		});
	});
});
app.post('/file', upload.array(), function(req, res) {
	res.render('editor.jade', {
		dir: req.body.dir
	});

	var text ='';
	var file = req.body.dir;

	fs.readFile(file, function(err, data) {
		if (err) {
			text = '';
			console.log(err);
		}
		else text = data.toString('utf8');

		fs.writeFileSync(file, text);

		io.on('connection', function(socket) {
			io.emit('update', newUpdate(text, { begin: 0, end: 0}, 0));
		});
	});
});

io.on('connection', function(socket) {
			console.log('a user connected: ', socket.id);

			socket.on('disconnect', function() {
				console.log('user disconnected');
			});

			socket.on('update', function(update) {
				text = update.html;
				fs.writeFileSync(file, text);

				io.emit ('update', newUpdate(text, update.caret, update.key));
			});

			socket.on('file-move-update', function(update) {
				console.log(typeof update.filedir + " " + typeof update.file);
				fs.rename(path.normalize(update.filedir), path.normalize(update.dir + '/' + update.file), function(err, stats) {
					if (err) throw err;
					update.newFileDir = update.filedir, update.dir + '/' + update.file;

					io.emit('file-move-update', update);
				});
			});

			socket.on('file-delete-update', function(update) {
				rm(path.normalize(update), function(err) {
					console.log(err);
					io.emit('file-delete-update', update);
				});
			});
		});

http.listen(3000, function() {
	console.log('listening on *:3000');
});