$(window).ready(function(){

    $("<div id='suggestion-container' class='toolTipListWidth toolTip toolTipWhite mainContetTooltip'></div>").insertAfter("#_chatText");
    $("#suggestion-container").css('visibility', 'hidden');

    var start = /@/ig;
    var word = /@(\w+)/ig;
    var display_flag = false;
    var options = {
      caseSensitive: false,
      includeScore: false,
      shouldSort: true,
      threshold: 0.6,
      location: 0,
      distance: 100,
      maxPatternLength: 32,
      keys: ['keys'],
    };

    $("#_chatText").keyup(function(a) {
        var fuse = new Fuse(buildMemberListData(), options);
        var content = $(this).val();
        var go = content.match(start);
        var name = content.match(word);

        if (go && go.length > 0) {
            if (!display_flag) {
                var rect = document.getElementById('_chatText').getBoundingClientRect();
                position = Measurement.caretPos($("#_chatText"));
                position.top += parseInt($("#_chatText").css('font-size')) - rect.top;
                position.left -= rect.left;
                $("#suggestion-container").parent().css({position: 'relative'});
                $("#suggestion-container").css({top: position.top, left: position.left, position:'absolute'});
                $("#suggestion-container").html(buildList(buildMemberListData())).show();
                $("#suggestion-container").css('visibility', 'visible');
                display_flag = true;
            }
            if (name && name.length > 0) {
                $("#suggestion-container").html(buildList(fuse.search(name[0].substring(1)))).show();
                $("#suggestion-container").css('visibility', 'visible');
                $(".suggested-name").first().css("background-color", "#D8F0F9");
                $(".suggested-name").click(function () {
                    $(this).css("background-color", "red");
                    setSuggestedChatText(name, $(this).text(), $(this).data('cwui-lt-value'));
                });
                $(".suggested-name" ).mouseover(function() {
                    $(".suggested-name").css("background-color", "white");
                    $(this).css("background-color", "#D8F0F9");
                });
                $(".suggested-name" ).mouseout(function() {
                    $(this).css("background-color", "white");
                });
            }
            if (a.which == 9 || a.which == 13) {
                setSuggestedChatText(name, $(".suggested-name .autotrim").first().text(), $(".suggested-name").first().data('cwui-lt-value'));
            }
        } else {
            $("#suggestion-container").hide();
            $("#suggestion-container").css('visibility', 'hidden');
        }
        return false;
    });

    $("#_chatText").keydown(function (e) {
        if ((e.which == 9 || e.which == 13) && display_flag) {
            $("#_chatText").focus();
            e.preventDefault();
        }
    });

    function setSuggestedChatText(entered_text, target_name, cwid){
        var old = $("#_chatText").val();
        var content = old.replace(entered_text, "");
        var E = "[To:" + cwid + "] " + target_name;
        $("#_chatText").val(content + E + " ");
        $("#_chatText").focus();
        $("#suggestion-container").hide();
        $("#suggestion-container").css('visibility', 'hidden');
        display_flag = false;
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
