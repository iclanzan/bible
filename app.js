(function($) {
	'use strict';
	var cache = {};

	// Make the get function public
	this.get = function(url, callback) {
		if (url in cache) { callback(cache[url]); }

		// var temp = localStorage.getItem(url);
		// if (temp) { callback(cache[url] = temp); }

		$.get(url, function(data) {
			callback(cache[url] = JSON.parse(data));
		});
	};
}).call(this, jQuery);

(function($, get) {
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
	currentBook = '';

	function checkHash() {
		var fragments = window.location.hash.match(/#!\/(.+)\/(\d+)$/);
		if (!fragments) { return; }
		if (!(fragments[1] in bookMap)) { return; }
		if (fragments[2] > bookMap[fragments[1]].chapters) { return; }

		get(apiUrl + bookMap[fragments[1]].name + ' ' + fragments[2] + '&callback=?', changePage);
	}

	function changePage(data) {
		var title = data[0].bookname,
				subtitle = data[0].chapter,
				text = '';

		data.forEach(function(verse) {
			text += '<span class="verse">' + verse.text + '</span>';
		});

		renderPage(title, subtitle, text);
	}

	function renderPage(title, subtitle, text) {
		$('#ui').html(text);
	}

	function renderPlaceholders() {
		var i, html = '';
		books.forEach(function(book) {
			html += '<div id="' + book.slug + '" class="book"><ul>';
			for (i = 1; i <= book.chapters; i++) {
				html += '<li class="chapter"></li>';
			}
			html += '</ul></div>';
		});
		$('#ui').html(html);
	}

	books.forEach(function(book) {
		book.slug = book.name.toLowerCase().replace(' ', '-');
		bookMap[book.slug] = book;
	});

	renderPlaceholders();

	$(window).bind('hashchange', checkHash);
	$(window).trigger("hashchange");
}).call(this, jQuery, get, undefined);