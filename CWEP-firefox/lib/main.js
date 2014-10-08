// main.js

var data = require("sdk/self").data;
var pageMod = require("sdk/page-mod");
var Request = require("sdk/request").Request;
var ss = require("sdk/simple-storage");
var footer;

pageMod.PageMod({
    include: ["https://www.chatwork.com/*", "https://kcw.kddi.ne.jp/*"],
    contentScriptFile: [data.url("jquery-1.11.1.min.js"), data.url("my-content-script.js")],
    onAttach: function(worker) {
        var script_content;
        var emo_version = ss.storage.emo_version
        var emo_data_name = ss.storage.emo_data_name
        var emo_last_sync_time = ss.storage.emo_last_sync_time
        var emo_json = ss.storage.emo_json
        var CHECK_INTERVAL = 60 * 60 * 1000; // 1 hour
        footer = data.load("emo.js");

        if (ss.storage.emo_version == undefined || emo_last_sync_time == undefined || 
            ((new Date).getTime() - emo_last_sync_time) > CHECK_INTERVAL) {
            Request({
                url: "https://dl.dropboxusercontent.com/s/ik69cu3wnya6i0d/default.json?dl=1",
                onComplete: function (response) {
                    raw_data = JSON.parse(response.text);
                    ss.storage.emo_data_name = raw_data["data_name"];
                    ss.storage.emo_version = raw_data["data_version"];
                    ss.storage.emo_json = raw_data["emoticons"]
                    ss.storage.emo_last_sync_time = (new Date).getTime();
                }
            }).get();
        }
        script_content = prepareScript(ss.storage.emo_json);
        worker.port.emit('script-data', script_content);
    }
});

function prepareScript(emo_data){
    var header = "emo = " + JSON.stringify(emo_data) + ";\n";
    return header + footer;
}
