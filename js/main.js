
serviceUrl = "https://support.lsdsoftware.com:30299/news-scraper?capabilities=1.0";
state = "TOPICS";
topics = null;
topicIndex = 0;
articles = null;
articleIndex = 0;
article = null;
playing = false;

ajaxPost(serviceUrl, {
	method: "getSource",
	sourceIndex: 0
},
function(result) {
	topics = result.topics;
	topicIndex = 0;
})

function selectTopic() {
	state = "ARTICLES";
	articles = null;
	ajaxPost(serviceUrl, {
		method: "getTopic",
		sourceIndex: 0,
		topicIndex: topicIndex
	},
	function(result) {
		articles = result.articles;
		articleIndex = 0;
	})
}

function selectArticle() {
	state = "READING";
	article = null;
	ajaxPost(serviceUrl, {
		method: "getArticle",
		sourceIndex: 0,
		topicIndex: topicIndex,
		articleIndex: articleIndex
	},
	function(result) {
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

function ajaxPost(url, data, fulfill) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        if (xhr.status == 200) fulfill(JSON.parse(xhr.responseText));
        else console.error(xhr.responseText || xhr.statusText || xhr.status);
      }
    };
    xhr.send(JSON.stringify(data));
}

function toggle(elem, visible) {
	elem.style.display = visible ? "" : "none";
}
