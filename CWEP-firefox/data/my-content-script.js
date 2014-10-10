var s = document.createElement('script');

self.port.on("script-data", function handleMessage(payload) {
    s.innerHTML = payload;
    s.onload = function() {
        this.parentNode.removeChild(this);
    };
    (document.documentElement).appendChild(s);
});
