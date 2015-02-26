// main.js

var data = require("sdk/self").data;
var pageMod = require("sdk/page-mod");
var Request = require("sdk/request").Request;
var ss = require("sdk/simple-storage");
var footer;

var { ToggleButton } = require('sdk/ui/button/toggle');
var panels = require("sdk/panel");
var self = require("sdk/self");

var button = ToggleButton({
    id: "my-button",
    label: "my button",
    icon: {
        "16": "./icon-16.png",
        "32": "./icon-32.png",
    },
    onChange: handleChange
});

var panel = panels.Panel({
    contentURL: self.data.url("panel.html"),
    contentScriptFile: self.data.url("update.js"),
    onHide: handleHide,
    width: 240,
    height: 150,
});

panel.on("show", sendStatus);

panel.port.on("update-emo", function() {
    updateEmoticons();
    sendStatus();
});

function sendStatus(){
    panel.port.emit(
        "update-status",
        ss.storage.emo_data_name,
        ss.storage.emo_last_sync_time
    );
}

function handleChange(state) {
    if (state.checked) {
        panel.show({
            position: button
        });
    }
}

function handleHide() {
    button.state('window', {checked: false});
}

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
            updateEmoticons();
        }
        script_content = prepareScript(ss.storage.emo_json);
        worker.port.emit('script-data', script_content);
    }
});

function updateEmoticons(){
    Request({
        url: "https://www.dropbox.com/s/gbo327jnnip4mwe/all_emo.js?dl=1",
        onComplete: function (response) {
            raw_data = JSON.parse(response.text);
            ss.storage.emo_data_name = raw_data["data_name"];
            ss.storage.emo_version = raw_data["data_version"];
            ss.storage.emo_json = raw_data["emoticons"]
            ss.storage.emo_last_sync_time = (new Date).getTime();
        }
    }).get();
}

function prepareScript(emo_data){
    var header = "emo = " + JSON.stringify(emo_data) + ";\n";
    return header + footer;
}
