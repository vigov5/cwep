var s = document.createElement('script');
// TODO: add "script.js" to web_accessible_resources in manifest.json
s.src = chrome.extension.getURL('emo.js');
s.onload = function() {
    this.parentNode.removeChild(this);
};
(document.documentElement).appendChild(s);

