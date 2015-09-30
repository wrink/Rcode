var socket = io();

function newUpdate(html, caret, key)
{
	return {
		html: html,
		caret: caret,
		key: key
	};
}

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
	        endCaretOffset = preCaretRange.toString().length;
	        caretOffset = endCaretOffset - sel.toString().length;
	    }
	} else if ( (sel = doc.selection) && sel.type != "Control") {
	    var textRange = sel.createRange();
	    var preCaretTextRange = doc.body.createTextRange();
	    preCaretTextRange.moveToElementText(this[0]);
	    preCaretTextRange.setEndPoint("EndToEnd", textRange);
	    caretOffset = preCaretTextRange.text.length;
	    endCaretOffset = caretOffset;
	}
	return { begin: caretOffset, end: endCaretOffset };
};

/*$.fn.setCaret = function (index) {
	var doc = this[0].ownerDocument || this[0].document;
	var win = doc.defaultView || doc.parentWindow;
	var sel = doc.selection;
	var textRange = sel.createRange;
	range = doc.createRange();
	range.setStart(this[0].firstChild, 0);
	range
	if (sel.rangeCount > 0) {
		sel.removeAllRanges();
	}
};*/

$(document).ready(function() {
	console.log(document.location.pathname);

	$('#editor').keyup(function(event) {
		//change 4
		socket.emit('update', newUpdate(this.innerText, $(this).caret(), event.keyCode));
	});

	$('#editor').keydown(function(event) {
		if (event.keyCode === 9) {
			var caret = $(this).caret();

			event.preventDefault();
			document.execCommand('insertText', false, '\t');

			$(this).setCaret(caret.begin + 1);
		}
		else if (event.keyCode === 13) {
			var caret = $(this).caret();

			event.preventDefault();
			document.execCommand('insertText', false, '\n');

			$(this).setCaret(caret.begin + 1);
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
		//change 5
		curCaret = $('#editor').caret();

		$('#editor')[0].innerHTML = update.html;

		if (update.caret.begin > curCaret.end) {
			//TODO: set caret
		}
	});
});