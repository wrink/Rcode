var socket = io();

$.fn.caret = function () {
	var caretOffset = 0;
	var endCaretOffset = 0;
	var doc = this[0].ownerDocument || this[0].document;
	var win = doc.defaultView || doc.parentWindow;
	var sel;
	if (typeof win.getSelection != "undefined") {
	    sel = win.getSelection();
	    if (sel.rangeCount > 0) {
	        var range = win.getSelection().getRangeAt(0);
	        var preCaretRange = range.cloneRange();
	        preCaretRange.selectNodeContents(this[0]);
	        preCaretRange.setEnd(range.endContainer, range.endOffset);
	        caretOffset = preCaretRange.toString().length;
	    }
	} else if ( (sel = doc.selection) && sel.type != "Control") {
	    var textRange = sel.createRange();
	    var preCaretTextRange = doc.body.createTextRange();
	    preCaretTextRange.moveToElementText(this[0]);
	    preCaretTextRange.setEndPoint("EndToEnd", textRange);
	    caretOffset = preCaretTextRange.text.length;
	    endCaretOffset = caretOffset;
	}
	return { begin: caretOffset, end: caretOffset };
};

$(document).ready(function() {
	console.log(document.location.pathname);

	$('#editor').keyup(function() {
		socket.emit('update', $(this)[0].innerText);
	});

	$('#editor').keydown(function(event) {
		if (event.keyCode === 9) {
			event.preventDefault();
			document.execCommand('insertText', false, '\t');
		}
	});

	/*$('#editor').keydown(function(event) {
        if(event.keyCode === 9) { // tab was pressed
			// prevent the focus lose
			event.preventDefault();

			// get caret position/selection
			var start = $('#editor').caret().begin;
			var end = $('#editor').caret().end;

			var target = event.target;
			var value = target.textContent;

 			// set textarea value to: text before caret + tab + text after caret
			target.textContent = value.substring(0, start)
                            + "\t"
                            + value.substring(end);

			// put caret at right position again (add one for the tab)
			this.selectionStart = this.selectionEnd = start + 1;
        }
        else if(event.keyCode === 13) { // enter was pressed
			// prevent the focus lose
			event.preventDefault();

			// get caret position/selection
			var start = $('#editor').caret().begin;
			var end = $('#editor').caret().end;

			var target = event.target;
			var value = target.textContent;

			// set textarea value to: text before caret + tab + text after caret
			target.textContent = value.substring(0, start)
			                + "\n"
			                + value.substring(end);

			// put caret at right position again (add one for the tab)
			this.selectionStart = this.selectionEnd = start + 1;
		}
	});*/

	socket.on('update', function(update) {
		$('#editor')[0].innerHTML = update;
	});
});