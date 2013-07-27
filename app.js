// Create gesture events for jQuery
function gestures(element) {
	function getCoordinates(event, x, y) {
		if (x !== undefined) { return {x: x, y: y}; }
		var touch = hasTouch ? (event.touches ? event.touches[0] : event.originalEvent.touches[0]) : event;

		return {x: touch.pageX, y: touch.pageY};
	}

	var hasTouch = ('ontouchstart' in window),
			start = hasTouch? 'touchstart' : 'mousedown',
			move = hasTouch? 'touchmove' : 'mousemove',
			end = hasTouch? 'touchend' : 'mouseup',
			cancel = hasTouch? 'touchcancel' : 'mouseout',

			treshold = 10,
			started = false,
			initialScroll = {top: 0, left: 0},
			scrollSum = {x: 0, y: 0},
			timer;

	function startHandler(event, x, y) {
		if (started) { return; }
		started = true;

		event.preventDefault();

		var initialTouch = getCoordinates(event, x, y),
				deltaX = 0, deltaY = 0, axis, $element = $(event.target), startTime = new Date().getTime();

		$element.trigger('touch', [initialTouch.x, initialTouch.y]);

		function moveHandler(event, x, y) {
			var touch = getCoordinates(event, x, y);

			deltaX = touch.x - initialTouch.x;
			deltaY = touch.y - initialTouch.y;

			if (!axis) {
				if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < treshold) { return; }

				axis = Math.abs(deltaX) > Math.abs(deltaY) ? 'X' : 'Y';
			}

			$element.trigger( 'drag' + axis, [deltaX, deltaY]);
		}

		function endHandler(event, x, y) {
			$element.unbind(move, moveHandler)
							.unbind(end, endHandler);

			if (!axis) {
				$element.trigger('tap', event);
			}
			else {
				var swipe;
				if (axis === 'X') { swipe = deltaX > 0 ? 'swipeRight' : 'swipeLeft'; }
				else { swipe = deltaY > 0 ? 'swipeDown' : 'swipeUp'; }
				$element.trigger('drag' + axis + 'End', [deltaX, deltaY]).trigger(swipe, [deltaX, deltaY]);
			}

			started = false;
		}

		$element.bind(move, moveHandler)
						.bind(end, endHandler);
	}

	$(element).on( start, startHandler)
		.on('scroll', function(event) {
			var x = - $(this).scrollLeft(),
					y = - $(this).scrollTop();

			x += initialScroll.left;
			y += initialScroll.top;

			if (!x && !y) { return; }

			x += scrollSum.x;
			y += scrollSum.y;

			if (started) {
				scrollSum.x = x;
				scrollSum.y = y;
				$(this).trigger(move, [x, y]);
			}
			else {
				initialScroll.top =  $(this).children().height() / 3;
				initialScroll.left = $(this).children().width() / 3;
				scrollSum.x = 0;
				scrollSum.y = 0;
				$(this).trigger(start, [x, y]);
			}

			$(this).scrollLeft(initialScroll.left);
			$(this).scrollTop(initialScroll.top);

			var that = this;
			window.clearTimeout(timer);
			timer = window.setTimeout(function() {
				$(that).trigger(end, [x, y]);
				scrollSum.x = scrollSum.y = 0;
			}, 100);
		});
}

// Provides access to data. Implements the 'get' method.
(function($) {
	'use strict';
	var cache = {};

	// Make the get function public
	this.get = function(url, callback) {
		if (url in cache) { callback(cache[url]); }

		// var temp = localStorage.getItem(url);
		// if (temp) { callback(cache[url] = temp); }

		$.ajax({
			url: url,
			cache: false,
			dataType: 'jsonp',
			success: function(data) {
				data.forEach(function(verse) {
					verse.text = verse.text.replace(/<a.*a>/g, '' );
				});
				callback(cache[url] = data);
			}
		});
	};
}).call(this, jQuery);

(function($) {
	var props = getProps(), cache = {};

	function getProps() {
		var t, dummy = document.createElement('dummy'), ret = {},
		transitions = {
			'transition':'transitionend', // Firefox
			'OTransition':'oTransitionEnd',
			'MSTransition':'msTransitionEnd',
			'MozTransition':'transitionend',
			'WebkitTransition':'webkitTransitionEnd'
		},
		transforms = {
			'Transform':'transform',
			'WebkitTransform':'-webkit-transform',
			'OTransform':'-o-transform',
			'MSTransform':'-ms-transform',
			'MozTransform':'-moz-transform'
		};

		for(t in transitions) {
				if( dummy.style[t] !== undefined ){
						ret.transition = t;
						ret.transitionEnd = transitions[t];
						break;
				}
		}
		for(t in transforms) {
				if( dummy.style[t] !== undefined ){
						ret.transform = t;
						break;
				}
		}
		return ret;
	}

	this.render = {
		translate: function(e, x, y, z, s, c) {
			if (x === null) { x = cache[e] && cache[e].x || 0; }
			if (y === null) { y = cache[e] && cache[e].y || 0; }
			if (z === null) { z = cache[e] && cache[e].z || 0; }
			cache[e] = {x: x, y: y, z: z};

			var args = {};
			args[props.transition] = 'all ' + (s || 0) + 's ease-out';
			args[props.transform] = 'translate3d(' + x + ', ' + y + ', ' + z + ')';

			$(e).css(args).one(props.transitionEnd, function() {
				$(this).css(props.transition, 'none');
				if (c) { c(); }
			});
			// $(e).css(props.transform, 'translate('+x+', '+y+')');
		}
	};
}).call(this, jQuery);

(function($, get, render, undefined) {
	'use strict';

	var books = [
		{name: 'Genesis',         chapters:  50}, {name: 'Exodus',          chapters: 40}, {name: 'Leviticus',    chapters: 27},
		{name: 'Numbers',         chapters:  36}, {name: 'Deuteronomy',     chapters: 34}, {name: 'Joshua',       chapters: 24},
		{name: 'Judges',          chapters:  21}, {name: 'Ruth',            chapters:  4}, {name: '1 Samuel',     chapters: 31},
		{name: '2 Samuel',        chapters:  24}, {name: '1 Kings',         chapters: 22}, {name: '2 Kings',      chapters: 25},
		{name: '1 Chronicles',    chapters:  29}, {name: '2 Chronicles',    chapters: 36}, {name: 'Ezra',         chapters: 10},
		{name: 'Nehemiah',        chapters:  13}, {name: 'Esther',          chapters: 10}, {name: 'Job',          chapters: 42},
		{name: 'Psalms',          chapters: 150}, {name: 'Proverbs',        chapters: 31}, {name: 'Ecclesiastes', chapters: 12},
		{name: 'Song of Solomon', chapters:   8}, {name: 'Isaiah',          chapters: 66}, {name: 'Jeremiah',     chapters: 52},
		{name: 'Lamentations',    chapters:   5}, {name: 'Ezekiel',         chapters: 48}, {name: 'Daniel',       chapters: 12},
		{name: 'Hosea',           chapters:  14}, {name: 'Joel',            chapters:  3}, {name: 'Amos',         chapters:  9},
		{name: 'Obadiah',         chapters:   1}, {name: 'Jonah',           chapters:  4}, {name: 'Micah',        chapters:  7},
		{name: 'Nahum',           chapters:   3}, {name: 'Habakkuk',        chapters:  3}, {name: 'Zephaniah',    chapters:  3},
		{name: 'Haggai',          chapters:   2}, {name: 'Zechariah',       chapters: 14}, {name: 'Malachi',      chapters:  4},

		{name: 'Matthew',         chapters:  28}, {name: 'Mark',            chapters: 16}, {name: 'Luke',         chapters: 24},
		{name: 'John',            chapters:  21}, {name: 'Acts',            chapters: 28}, {name: 'Romans',       chapters: 16},
		{name: '1 Corinthians',   chapters:  16}, {name: '2 Corinthians',   chapters: 13}, {name: 'Galatians',    chapters:  6},
		{name: 'Ephesians',       chapters:   6}, {name: 'Philippians',     chapters:  4}, {name: 'Colossians',   chapters:  4},
		{name: '1 Thessalonians', chapters:   5}, {name: '2 Thessalonians', chapters:  3}, {name: '1 Timothy',    chapters:  6},
		{name: '2 Timothy',       chapters:   4}, {name: 'Titus',           chapters:  3}, {name: 'Philemon',     chapters:  1},
		{name: 'Hebrews',         chapters:  13}, {name: 'James',           chapters:  5}, {name: '1 Peter',      chapters:  5},
		{name: '2 Peter',         chapters:   3}, {name: '1 John',          chapters:  5}, {name: '2 John',       chapters:  1},
		{name: '3 John',          chapters:   1}, {name: 'Jude',            chapters:  1}, {name: 'Revelation',   chapters: 22}
	], bookMap = {},
	apiUrl = 'http://labs.bible.org/api/?type=json&passage=',
	body = $('body'),
	ui = $('#ui'),
	open = false,
	tileHeight,
	tileWidth,
	bodyHeight,
	bodyWidth,
	transitionSpeed = 0,
	scrollTimer,
	resizeTimer,
	scrollingTop = false,
	scrollingLeft = false,
	lastScrollTop = 0,
	lastScrollLeft = 0,
	lastViewScroll = 0,
	lastSheetScroll = 0,
	currentBook = '',
	currentBookIndex = 0,
	currentChapter = 0,
	renderedChapters = {};

	books.forEach(function(book) {
		book.slug = book.name.toLowerCase().replace(/\s/g, '-');
		bookMap[book.slug] = book;
	});

	function init() {
		// Transforming the ui dimensions from percent to pixels fixes graphic glitches.
		ui.css({height: '', width: ''});
		tileHeight = ui.height(); ui.height(tileHeight);
		tileWidth = ui.width(); ui.width(tileWidth);

		var h = $('#scroll').height(), w = $('#scroll').width();

		$('#dummy').width(w * 3);
		$('#dummy').height(h * 3);
		$('#scroll').scrollLeft(w);
		$('#scroll').scrollTop(h);
	}

	function checkHash() {
		var fragments = window.location.hash.match(/#!\/(.+)\/(\d+)$/);
		if (!fragments) { return; }
		if (!(fragments[1] in bookMap)) { return; }
		if (fragments[2] > bookMap[fragments[1]].chapters) { return; }

		changePage(fragments[1], fragments[2] - 0);
	}

	function changePage(slug, chapter) {
		var nextBookIndex = books.indexOf(bookMap[slug]);
		if (currentBook) {
			$('#' + currentBook + '-' + currentChapter).removeClass('current');
		}
		$('#' + slug + '-' + chapter).addClass('current');

		render.translate('#' + currentBook, '0%', null, null, 0.3);

		lastScrollTop = nextBookIndex * tileHeight;
		render.translate('#ui', null, (-lastScrollTop) + 'px', null, transitionSpeed);

		lastScrollLeft = (chapter - 1) * tileWidth;
		render.translate('#' + slug, (-lastScrollLeft) + 'px', null, null, transitionSpeed);

		transitionSpeed = 0.3;

		renderChapter(slug, chapter, '#view .current');

		render.translate('#sheet', 0, 0, 0, 0);

		currentBook = slug;
		currentBookIndex = nextBookIndex;
		currentChapter = chapter;

		if (!open) {
			if (currentChapter > 1) {
				renderChapter(slug, currentChapter - 1, '#view .previous');
			}
			if (currentChapter < bookMap[slug].chapters) {
				renderChapter(slug, currentChapter + 1, '#view .next');
			}
		}
	}

	function renderChapter(slug, chapter, element) {
		get(apiUrl + bookMap[slug].name + ' ' + chapter, function(data) {
			var html = '<article><h1>' + bookMap[slug].name + '</h1><h4>Chapter ' + chapter + '</h4><div id="text">';
			data.forEach(function(verse) {
				if (verse.title) { html += '<h3>' + verse.title + '</h3>'; }
				html += '<span class="verse" title="' + verse.verse + '">' + verse.text + '</span>';
			});
			html += '</div></article>';
			$(element).html(html);
		});
	}

	function renderPlaceholders() {
		var i, html = '';
		books.forEach(function(book) {
			html += '<div id="' + book.slug + '" class="book"><h2>' + book.name + '</h2><ul id="' + book.slug +'-space">';
			for (i = 1; i <= book.chapters; i++) {
				html += '<li id="' + book.slug + '-' + i + '" class="chapter"><div class="counter">' + i + '</div></li>';
			}
			html += '</ul></div>';
		});
		ui.html(html);
	}

	function swipeDown(event, speed) {
		if (!body.hasClass('open') && !$('#view').scrollTop()) {
			body.addClass('open');
		}
	}

	function tap() {
		if (open) {
			if (currentChapter > 1) {
				renderChapter(currentBook, currentChapter - 1, '#view .previous');
			}
			if (currentChapter < bookMap[currentBook].chapters) {
				renderChapter(currentBook, currentChapter + 1, '#view .next');
			}
			body.removeClass('open');
			open = false;
		}
		else {

		}
	}

	function dragY(event, x, y) {
		if (open) {
			dragBooks(event, x, y);
		}
		else {
			dragView(event, x, y);
		}
	}

	function dragYEnd(event, x, y) {
		if (open) {
			dragBooksEnd(event, x, y);
		}
		else {
			dragViewEnd(event, x, y);
		}
	}

	function dragX(event, x, y) {
		if (open) {
			dragChapters(event, x, y);
		}
		else {
			dragSheet(event, x, y);
		}
	}

	function dragXEnd(event, x, y) {
		if (open) {
			dragChaptersEnd(event, x, y);
		}
		else {
			dragSheetEnd(event, x, y);
		}
	}

	function prevChapter(event, x, y) {
		var i;
		if (currentChapter - 1 > 0) {
			body.addClass('open');
			window.setTimeout(function() { pathTo(currentBook, currentChapter - 1); }, 300);
			window.setTimeout(function() { body.removeClass('open'); }, 600);
			return;
		}
	}

	function toggleSelectVerse(event) {
		var $e = $(event.target);
		if ($e.hasClass('verse')) {
			$e.toggleClass('selected');
		}
		else {
			$e = $e.parent();
			if ($e.hasClass('verse')) {
				$e.toggleClass('selected');
			}
		}
	}

	function round(value, prev, next) {
		return next > prev ? Math.ceil(value) : Math.floor(value);
	}

	function dragBooks(event, x, y) {
		var newY = -lastScrollTop + y;
		newY = Math.max(-65 * tileHeight, Math.min( 0, newY));
		render.translate('#ui', null, newY + 'px', null, 0);
		return -newY;
	}

	function dragBooksEnd(event, x, y) {
		var scrollTop = dragBooks(event, x, y),
				nextBook = round(Math.min(scrollTop/tileHeight, 65), lastScrollTop, scrollTop);

		transitionSpeed = (scrollTop % tileHeight) / tileHeight;
		if (scrollTop > lastScrollTop) { transitionSpeed = 1 - transitionSpeed; }
		transitionSpeed /= 3;

		lastScrollTop = scrollTop;

		if (nextBook !== currentBookIndex) {
			pathTo(books[nextBook].slug, 1);
		}
		else {
			render.translate('#ui', null, -nextBook * 100 + '%', null, transitionSpeed);
		}
	}

	function dragChapters(event, x, y) {
		var newX = -lastScrollLeft + x;
		newX = Math.max(-(books[currentBookIndex].chapters - 1) * tileWidth, Math.min( 0, newX));
		render.translate('#' + currentBook, newX + 'px', null, null, 0);
		return -newX;
	}

	function dragChaptersEnd(event, x, y) {
		var scrollLeft = dragChapters(event, x, y),
				nextChapter = round(Math.min(scrollLeft/tileWidth, books[currentBookIndex].chapters - 1), lastScrollLeft, scrollLeft) + 1;

		transitionSpeed = (scrollLeft % tileWidth) / tileWidth;
		if (scrollLeft > lastScrollLeft) { transitionSpeed = 1 - transitionSpeed; }
		transitionSpeed /= 3;

		lastScrollLeft = scrollLeft;

		if (nextChapter !== currentChapter) {
			pathTo(currentBook, nextChapter);
		}
		else {
			render.translate('#' + currentBook, -currentChapter * tileWidth + 'px', null, null, transitionSpeed);
		}
	}

	function dragView(event, x, y) {
		var scroll = -lastViewScroll + y;
		scroll = Math.max( body.height() - $('#sheet .current article').outerHeight(), Math.min(lastViewScroll === 0 ? 160 : 0, scroll));

		if (scroll < 0) {
			render.translate('#sheet .current article', null, scroll + 'px', null, 0);
			render.translate('#sheet', 0, 0, 0, 0);
		}
		else {
			render.translate('#sheet', null, scroll + 'px', null, 0);
			render.translate('#sheet .current article', 0, 0, 0, 0);
		}
		return -scroll;
	}

	function dragViewEnd(event, x, y) {
		lastViewScroll = dragView(event, x, y);
	}

	function dragSheet(event, x, y) {
		var scroll = -lastSheetScroll + x,
				width = $('#view').width(),
				min = currentChapter < books[currentBookIndex].chapters ? - 1.06 * width : - 0.06 * width,
				max = currentChapter > 1 ? 1.06 * width : 0.06 * width;
		scroll = Math.max(min, Math.min(max, scroll));
		render.translate('#sheet', scroll + 'px', null, - Math.abs(scroll) / 5 + 'px', 0);
		return -scroll;
	}

	function dragSheetEnd(event, x, y) {
		var width = 1.06 * $('#view').width();
		lastSheetScroll = dragSheet(event, x, y);

		if (Math.abs(lastSheetScroll) < width / 3) {
			render.translate('#sheet', 0, null, 0, 0.3);
			lastSheetScroll = 0;
			return;
		}

		if (lastSheetScroll > 0) {
			render.translate('#sheet', - width + 'px', null, 0, 0.3, function() {
				pathTo(currentBook, currentChapter + 1);
			});
		}
		else {
			render.translate('#sheet', width + 'px', null, 0, 0.3, function() {
				pathTo(currentBook, currentChapter - 1);
			});
		}
		lastSheetScroll = 0;
	}

	function openView(event, x, y) {
		if (lastViewScroll < 0) {
			if (!open && lastViewScroll < -80) {
				body.addClass('open');
				open = true;
			}
			render.translate('#sheet', null, 0 + 'px', null, 0.3);
			lastViewScroll = 0;
		}
	}

	function pathTo(slug, chapter) {
		window.location.hash = '#!/' + slug + '/' + chapter;
	}



	$(document).ready(function() {
		renderPlaceholders();
		init();

		$(window)
			.resize(function() {
				window.clearTimeout(resizeTimer);
				resizeTimer = window.setTimeout(function() {
					init();
				}, 500);
			})
			.bind('hashchange', checkHash)
			.trigger("hashchange");

		body.addClass('loaded');

		$('#scroll')
			.on('dragY', dragY)
			.on('dragYEnd', dragYEnd)
			.on('dragX', dragX)
			.on('dragXEnd', dragXEnd)
			.on('swipeDown', openView)
			.on('tap', tap);

		$('#view').on('tap', toggleSelectVerse);

		gestures('#scroll');
	});
}).call(this, jQuery, get, render);
