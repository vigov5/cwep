var updateButton = document.getElementById("update-button");
updateButton.addEventListener('click', function(){
    self.port.emit("update-emo");
});

self.port.on("update-status", function handleMessage(name, sync_time) {
    var dataName = document.getElementById("data-name");
    dataName.innerHTML = name;
    var syncTime = document.getElementById("sync-time");
    syncTime.innerHTML = (new Date(sync_time)).toLocaleString();
});
