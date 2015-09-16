var socket = io();
$(document).ready(function() {
	console.log(document.location.pathname);

	$('#editor').keyup(function() {
		socket.emit('update', $(this).text());
		return false;
	});
	socket.on('update', function(update) {;
		$('#editor').html(update);
	});
});