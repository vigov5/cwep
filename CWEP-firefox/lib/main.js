// main.js

var data = require("sdk/self").data;
var pageMod = require("sdk/page-mod");
var script_content = data.load("emo.js");

pageMod.PageMod({
	include: ["https://www.chatwork.com/*", "https://kcw.kddi.ne.jp/*"],
	contentScriptFile: [data.url("jquery-1.11.1.min.js"), data.url("my-content-script.js")],
	onAttach: function(worker) {
		worker.port.emit('script-data', script_content);
	}
});
