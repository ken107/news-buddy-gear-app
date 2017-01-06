
state = "TOPICS";
topics = null;
topicIndex = 0;
articles = null;
articleIndex = 0;
article = null;
playing = false;

ajaxGet("http://app.diepkhuc.com:30112/news-scraper/0", function(result) {
	topics = result.topics;
	topicIndex = 0;
})

function selectTopic() {
	state = "ARTICLES";
	articles = null;
	ajaxGet("http://app.diepkhuc.com:30112/news-scraper/0/" + topicIndex, function(result) {
		articles = result.articles;
		articleIndex = 0;
	})
}

function selectArticle() {
	state = "READING";
	article = null;
	ajaxGet("http://app.diepkhuc.com:30112/news-scraper/0/" + topicIndex + "/" + articleIndex, function(result) {
		article = result;
		for (var i=0; i<article.texts.length; i+=3) {
			var utter = new SpeechSynthesisUtterance();
			utter.text = article.texts.slice(i,i+3).join("\n\n");
			utter.lang = "en_US";
			speechSynthesis.speak(utter);
		}
		playing = true;
	})
}

function togglePlayPause() {
	if (playing) {
		speechSynthesis.pause();
		playing = false;
	}
	else {
		speechSynthesis.resume();
		playing = true;
	}
}

function scrollTopic(up) {
	if (up) topicIndex--;
	else topicIndex++;
	topicIndex = (topicIndex + topics.length) % topics.length;
}

function scrollArticle(up) {
	if (up) articleIndex--;
	else articleIndex++;
	articleIndex = (articleIndex + articles.length) % articles.length;
}

function goBack() {
	if (state == "READING") state = "ARTICLES";
	else if (state == "ARTICLES") state = "TOPICS";
	else tizen.application.getCurrentApplication().exit();
}

window.onload = function() {
	document.addEventListener("tizenhwkey", function(e) {
		if (e.keyName == "back") goBack();
	});
	document.addEventListener("rotarydetent", function(e) {
		if (state == "TOPICS") scrollTopic(e.detail.direction == 'CCW');
		else if (state == "ARTICLES") scrollArticle(e.detail.direction == 'CCW');
	});
}

function ajaxGet(url, callback) {
	var httpRequest = new XMLHttpRequest();
	httpRequest.onreadystatechange = function() {
		if (httpRequest.readyState === XMLHttpRequest.DONE) {
			if (httpRequest.status === 200) callback(JSON.parse(httpRequest.responseText));
		}
	};
	httpRequest.open('GET', url);
	httpRequest.send();
}

function toggle(elem, visible) {
	elem.style.display = visible ? "" : "none";
}
