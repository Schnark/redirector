(function () {
"use strict";

var data = {
	bookmarks: [],
	redirects: []
};

function escape (str) {
	return str.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;');
}

function loadData () {
	try {
		data = JSON.parse(localStorage.getItem('redirector-data') || 'x');
	} catch (e) {
	}
}

function saveData () {
	try {
		localStorage.setItem('redirector-data', JSON.stringify(data));
	} catch (e) {
	}
}

function getUrl () {
	return document.getElementById('url').value;
}

function setUrl (url) {
	document.getElementById('url').value = url;
	onUrlInput();
}

function isBookmark (url) {
	return data.bookmarks.indexOf(url) > -1;
}

function addBookmark (url) {
	data.bookmarks.push(url);
	saveData();
	buildBookmarks();
}

function removeBookmark (url) {
	var index = data.bookmarks.indexOf(url);
	if (index === -1) {
		return;
	}
	data.bookmarks.splice(index, 1);
	saveData();
	buildBookmarks();
}

function buildBookmarks () {
	document.getElementById('bookmark-list').innerHTML = data.bookmarks.map(function (url) {
		return '<li data-url="' + escape(url) + '">' + escape(url) + '</li>';
	}).join('');
}

function showBookmarks () {
	document.getElementById('bookmarks').className = 'visible';
}

function hideBookmarks () {
	document.getElementById('bookmarks').className = 'hidden';
}

function addRedirect (title, url) {
	data.redirects.push({title: title, url: url});
	saveData();
	buildRedirects();
}

function removeRedirect (index) {
	data.redirects.splice(index, 1);
	saveData();
	buildRedirects();
}

function buildRedirects () {
	var url = getUrl();
	document.getElementById('redirect-list').innerHTML = data.redirects.map(function (redirect, index) {
		return '<li><a rel="noopener" target="_blank" href="' + escape(redirect.url + url) + '">' +
			escape(redirect.title) + '</a> <button data-index="' + index + '">x</button></li>';
	}).join('');
}

function onUrlInput () {
	document.getElementById('bookmark-star').className = isBookmark(getUrl()) ? 'bookmark' : 'no-bookmark';
	buildRedirects();
}

function onBookmarkStarClick () {
	var url = getUrl();
	if (isBookmark(url)) {
		removeBookmark(url);
	} else {
		addBookmark(url);
	}
	onUrlInput();
}

function onBookmarkOpenClick () {
	showBookmarks();
}

function onBookmarkClick (el) {
	setUrl(el.dataset.url);
	hideBookmarks();
}

function onBookmarkCloseClick () {
	hideBookmarks();
}

function onDeleteClick (el) {
	if (window.confirm('Really delete "' + data.redirects[el.dataset.index].title + '"?')) {
		removeRedirect(el.dataset.index);
	}
}

function onAddClick () {
	var title = document.getElementById('redirect-title'),
		url = document.getElementById('redirect-url');
	if (title.value && url.checkValidity()) {
		addRedirect(title.value, url.value);
		title.value = '';
		url.value = '';
	}
}

function onEditClick () {
	document.getElementById('redirects').className = 'edit';
}

function onNoEditClick () {
	document.getElementById('redirects').className = '';
}

function initEvents () {
	if (navigator.mozSetMessageHandler) {
		navigator.mozSetMessageHandler('activity', function (request) {
			setUrl(request.source.data.url || '');
		});
	}
	document.getElementById('url').addEventListener('keyup', onUrlInput);
	document.getElementById('bookmark-star').addEventListener('click', onBookmarkStarClick);
	document.getElementById('bookmark-open').addEventListener('click', onBookmarkOpenClick);
	document.getElementById('bookmark-close').addEventListener('click', onBookmarkCloseClick);
	document.getElementById('redirect-add').addEventListener('click', onAddClick);
	document.getElementById('redirect-edit').addEventListener('click', onEditClick);
	document.getElementById('redirect-no-edit').addEventListener('click', onNoEditClick);
	document.getElementById('bookmark-list').addEventListener('click', function (e) {
		if (e.target.tagName === 'LI') {
			onBookmarkClick(e.target);
		}
	});
	document.getElementById('redirect-list').addEventListener('click', function (e) {
		if (e.target.tagName === 'BUTTON') {
			onDeleteClick(e.target);
		}
	});
	onUrlInput();
}

loadData();
buildBookmarks();
initEvents();

})();