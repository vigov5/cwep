$(window).ready(function(){

    var start = /@/ig;
    var is_displayed = false;
    var is_inserted = false;
    var current_RM = null;
    var member_objects = [];
    var fuse = null;
    var options = {
        keys: ['keys'],
    };
    var chat_text_jquery = $('#_chatText');
    var chat_text_element = document.getElementById('_chatText');

    $("<div id='suggestion-container' class='toolTipListWidth toolTip toolTipWhite mainContetTooltip'></div>").insertAfter("#_chatText");
    hideSuggestionBox();
    
    function findAtmark(){
        content = chat_text_jquery.val();
        atmarks = content.match(start);
        // we only interested in @ symbol that: at the start of line or has a space before it
        if (content.lastIndexOf("@") != 0 && content.charAt(content.lastIndexOf("@") - 1) != " ") {
            return false;
        }
        if (atmarks) {
            spaces = getTypedText().match(/ /ig);
            // text from last @ to current caret position have more than 2 spaces
            if (spaces && spaces.length > 2) {
                return false;
            }
            return true;
        } else{
            // There is no @ symbol
            return false;
        }
    }

    function getTypedText(){
        content = chat_text_jquery.val();
        start_pos = content.lastIndexOf("@");
        end_pos = doGetCaretPosition(chat_text_element);
        txt = content.substr(start_pos, end_pos);
        if (txt) {
            return txt;
        } else {
            return '';
        }
    }

    function setSuggestionBoxPosition() {
        var rect = chat_text_element.getBoundingClientRect();
        var current_pos = doGetCaretPosition(chat_text_element);
        setCaretPosition(chat_text_element, chat_text_jquery.val().lastIndexOf('@') + 1)
        position = Measurement.caretPos(chat_text_jquery);
        position.top += parseInt(chat_text_jquery.css('font-size')) - rect.top + 2;
        position.left -= rect.left;
        $("#suggestion-container").parent().css({position: 'relative'});
        $("#suggestion-container").css({top: position.top, left: position.left, position:'absolute'});
        setCaretPosition(chat_text_element, current_pos);
    }

    function showSuggestionBox(content){
        is_inserted = false;
        $("#suggestion-container").html(content).show();
        $("#suggestion-container").css('visibility', 'visible');
        $(".suggested-name").first().css("background-color", "#D8F0F9");

        $(".suggested-name").click(function () {
            if (is_inserted) return;
            is_inserted = true;
            $(this).css("background-color", "#D8F0F9");
            setSuggestedChatText(getTypedText(), $(this).text(), $(this).data('cwui-lt-value'));
        });
        
        $(".suggested-name" ).mouseover(function() {
            $(this).siblings().css("background-color", "white");
            $(this).css("background-color", "#D8F0F9");
        });
        
        $(".suggested-name" ).mouseout(function() {
            $(this).css("background-color", "white");
        });
    }

    function hideSuggestionBox(content){
        $("#suggestion-container").html(content).hide();
        $("#suggestion-container").css('visibility', 'hidden');
        is_displayed = false;
    }

    // http://blog.vishalon.net/index.php/javascript-getting-and-setting-caret-position-in-textarea/
    function doGetCaretPosition(ctrl){
        var CaretPos = 0;   // IE Support
        if (document.selection) {
            ctrl.focus ();
            var Sel = document.selection.createRange ();
            Sel.moveStart ('character', -ctrl.value.length);
            CaretPos = Sel.text.length;
        }
        // Firefox support
        else if (ctrl.selectionStart || ctrl.selectionStart == '0')
            CaretPos = ctrl.selectionStart;
        return (CaretPos);
    }

    function setCaretPosition(ctrl, pos){
        if(ctrl.setSelectionRange)
        {
            ctrl.focus();
            ctrl.setSelectionRange(pos,pos);
        }
        else if (ctrl.createTextRange) {
            var range = ctrl.createTextRange();
            range.collapse(true);
            range.moveEnd('character', pos);
            range.moveStart('character', pos);
            range.select();
        }
    }

    // hide suggestion box when cick in textarea
    chat_text_jquery.click(function(){
        hideSuggestionBox();
    });

    chat_text_jquery.keyup(function(e) {
        if (current_RM != RM.id) {
            member_objects = buildMemberListData();
            fuse = new Fuse(member_objects, options);
            current_RM = RM.id;
        }
        
        if (findAtmark()) {
            if (!is_displayed) {
                setSuggestionBoxPosition();
                showSuggestionBox(buildList(member_objects));
                is_displayed = true;
            }
            if (getTypedText().length) {
                if (getTypedText().substring(1)) {
                    showSuggestionBox(showSuggestionBox(buildList(fuse.search(getTypedText().substring(1)))));
                } else {
                    showSuggestionBox(buildList(member_objects));
                }
            }
            if (e.which == 9 || e.which == 13 && is_displayed) {
                if ($(".suggested-name").first().length) {
                    setSuggestedChatText(getTypedText(), $(".suggested-name .autotrim").first().text(), $(".suggested-name").first().data('cwui-lt-value'));                
                } else {
                    // there's no thing after @ symbol
                    hideSuggestionBox();
                }
            }
            if (e.which == 27 && is_displayed) {
                // when user press ESC, we hide suggestion box
                hideSuggestionBox();
            }
        } else {
            hideSuggestionBox();
        }

        return false;
    });

    chat_text_jquery.keydown(function (e) {
        if ((e.which == 9 || e.which == 13) && is_displayed) {
            chat_text_jquery.focus();
            e.preventDefault();
        }
    });

    function setSuggestedChatText(entered_text, target_name, cwid){
        var old = chat_text_jquery.val();
        var content = old.replace(entered_text, "");
        var E = "[To:" + cwid + "] " + target_name;
        chat_text_jquery.val(content + E + " ");
        chat_text_jquery.focus();
        hideSuggestionBox();
    }

    function buildList(members){
        if (members.length) {
            txt = '<ul>';
            for (var i = 0; i < members.length; i++) {
                txt += '<li class="suggested-name" role="listitem" data-cwui-lt-value="' + members[i].value + '">' + members[i].label + "</li>"
            };
            txt + '</ul>';
            return txt;
        } else {
            message = (LANGUAGE == 'ja') ? '\u691C\u7D22\u7D50\u679C\u306F\u3042\u308A\u307E\u305B\u3093' : 'No Matching Results';
            return '<ul><li>' + message + '</li></ul>';
        }
    }

    function buildMemberListData() {
        if (!RM) return [];
        sorted_member_list = RM.getSortedMemberList(),
        b = [],
        sorted_members_length = sorted_member_list.length;
        aid2name = {};
        for (var index = 0; index < sorted_members_length; index++) {
            var member = sorted_member_list[index];
            if (member != AC.myid) {
                var h = CW.is_business && ST.data.private_nickname && !RM.isInternal() ? AC.getDefaultNickName(member) : AC.getNickName(member);
                aid2name[member] = h;
                b.push({
                    keys: AC.getSearchKeys(member)[0],
                    value: member,
                    label: CW.getAvatarPanel(member, {
                        clicktip: !1,
                        size: "small"
                    }) + '<p class="autotrim">' + escape_html(h) + "</p>"
                })
            }
        }
        return b;
    }
});
