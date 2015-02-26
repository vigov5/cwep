
var DEFAULT_IMG_HOST = "http://chatpp.thangtd.com/";

function htmlEncode(value){
    //create a in-memory div, set it's inner text(which jQuery automatically encodes)
    //then grab the encoded contents back out.  The div never exists on the page.
    return $('<div/>').text(value).html();
}

function htmlDecode(value){
    return $('<div/>').html(value).text();
}

var timer;

$(document).ready(function(){
    timer = setInterval(
        function(){
            if (CW.reg_cmp[67] != undefined) {
                add_emo();
                window.clearInterval(timer);
            }
        },
        1000
    );
});

function add_emo(){
    for (var index = 0; index < emo.length; index++) {
        var rep = "";
        var encoded_text = htmlEncode(emo[index].key);
        var img_src = getEmoUrl(emo[index].src);
        if (isSpecialEmo(emo[index].key)) {
            rep = '<img src="' + img_src + '" class="ui_emoticon"/>';
        } else {
            rep = '<img src="' + img_src + '" title="' + encoded_text + '" alt="' +
            encoded_text + '" class="ui_emoticon"/>';
        }
        CW.reg_cmp.push({
            key: new RegExp(emo[index].regex, 'g'),
            rep: rep,
            reptxt: emo[index].key
        });
    }
}

function getEmoUrl(img) {
    if (img.indexOf('https://') == 0 || img.indexOf('http://') == 0) {
        return img;
    }
    return DEFAULT_IMG_HOST + "img/emoticons/" + img;
}

function isSpecialEmo(emo) {
    var special_emo = [':-ss', ':-??'];
    return special_emo.indexOf(emo) > -1;
}
