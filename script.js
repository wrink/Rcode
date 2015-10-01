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

$.fn.setCaret = function (start, end) {
	var startCounter = start;
	var endCounter = end;
	var doc = this[0].ownerDocument || this[0].document;
	var win = doc.defaultView || doc.parentWindow;
	var range = doc.createRange();
	var sel = win.getSelection();
	var nodeSet = this[0].childNodes;
	var start = function(nodes) {
		for (var i=0; i<nodes.length && startCounter>0; i++)
		{
			if (nodes[i].childNodes.length > 0) start(nodes[i].childNodes);
			else if(nodes[i].textContent.length < startCounter) startCounter -= nodes[i].textContent.length;
			else {
				range.setStart(nodes[i], startCounter);
				startCounter = 0;
			}
		}
	};
	var end = function(nodes) {
		for (var i=0; i<nodes.length && endCounter>0; i++)
		{
			if (nodes[i].childNodes.length > 0) end(nodes[i].childNodes);
			else if(nodes[i].textContent.length < endCounter) {
				endCounter -= nodes[i].textContent.length;
			}
			else {
				range.setEnd(nodes[i], endCounter);
				endCounter = 0;
			}
		}
	};

	start(nodeSet);
	end(nodeSet);

	sel.removeAllRanges();
	sel.addRange(range);

	var caret = this.caret();
};

$(document).ready(function() {
	console.log(document.location.pathname);

	$('#editor').keyup(function(event) {
		socket.emit('update', newUpdate(this.innerText, $(this).caret(), event.keyCode));
	});

	$('#editor').keydown(function(event) {
		if (event.keyCode === 9) {
			event.preventDefault();
			document.execCommand('insertText', false, '\t');
		}
		else if (event.keyCode === 13) {
			event.preventDefault();
			document.execCommand('insertText', false, '\n');
		}
	});

socket.on('update', function(update) {
		curCaret = $('#editor').caret();

		$('#editor')[0].innerHTML = hljs.highlightAuto(update.html).value;

		if (curCaret.begin > update.caret.end)
		{
			var diff = (update.caret.begin - update.caret.end) + 1;
			if (update.key == 8 || update.key == 46) diff -= 2;
			else if (update.key == 9 || update.key == 13);
			else if (update.key < 48) diff--;

			$('#editor').setCaret(curCaret.begin + diff, curCaret.end + diff);
		}
		else $('#editor').setCaret(curCaret.begin, curCaret.end);
	});
});