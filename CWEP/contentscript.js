var s = document.createElement('script');
var f = document.createElement('script');
var m = document.createElement('script');
// TODO: add "script.js" to web_accessible_resources in manifest.json
s.src = chrome.extension.getURL('main.js');
f.src = chrome.extension.getURL('fuse.min.js');
m.src = chrome.extension.getURL('caretposition.js');
s.onload = function() {
    this.parentNode.removeChild(this);
};
f.onload = function() {
    this.parentNode.removeChild(this);
};
m.onload = function() {
    this.parentNode.removeChild(this);
};
(document.documentElement).appendChild(s);
(document.documentElement).appendChild(f);
(document.documentElement).appendChild(m);

