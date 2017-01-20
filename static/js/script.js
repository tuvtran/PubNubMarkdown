$(document).ready(function() {
    // References to pad and markdown elements
    var $pad = $("#raw-pad");
    var $markdown = $("#markdown");

    // set up timeout to trigger event when user finished typing
    var typingTimer;                // time identifier
    var doneTypingInterval = 500;   // time in ms, in this case it's 250ms

    // Initialize Showdownjs
    var converter = new showdown.Converter();

    // Initialize PubNub
    var publishKey = "pub-c-851e2df6-cacf-487b-a0cc-39177adc1c03";
    var subscribeKey = "sub-c-18d97eee-dc04-11e6-93ca-0619f8945a4f";

    // user list
    var listOfUUIDs;

    // generate a unique user id
    var userID = 'user' + (Math.floor(Math.random() * 100) + 1).toString();

    var pubnub = new PubNub({
        publishKey: publishKey,
        subscribeKey: subscribeKey,
        uuid: userID,
        presenceTimeout: 60,        // for testing only
        heartBeatInterval: 15       // for testing only   
    })

    pubnub.addListener({
        message: function(obj) {
            $pad.val(obj.message.such);
            $markdown.html(converter.makeHtml(obj.message.such));
        },
        status: function(status) {
            if (status.category == "PNConnectedCategory") {
                console.log("Connected successfully");
            }
        },
        presence: function(event) {
            if(event.action) {
                if (event.action == 'state-change') {
                    if (event.state.isTyping === true) {
                        $("#is-typing").html("<em>" + event.uuid + " is typing</em>");
                    } else {
                        $("#is-typing").empty();
                    }
                }

                pubnub.hereNow({
                    channel: 'markdown'
                }, function(status, response) {
                    // every time there is an event in presence, update the user list again
                    listOfUUIDs = response["channels"]["markdown"]["occupants"];
                    updateUsersList();
                    console.log(listOfUUIDs);
                });
            }
            console.log(event.uuid + " " + event.action + " occupancy is now " + event.occupancy);
        }
    });

    pubnub.subscribe({
        channels: ['markdown'],
        withPresence: true
    });

    // publish message
    var publishValue = function(text) {
        pubnub.publish(
            {
                message: {
                    such: text
                },
                channel: 'markdown'
            },
            function (status, response) {
                if (status.error) {
                    console.log(status);
                } else {
                    console.log("message published ", response.timetoken);
                }
            }
        );
    }

    // Update the online user list in real time
    var updateUsersList = function() {
        if (listOfUUIDs) {
            $("#user-list").empty();
            listOfUUIDs.forEach(function(user) {
                var currentUUID = user["uuid"];
                var active;;
                if (currentUUID == userID) {
                    active = "active";
                } else {
                    active = "";
                }
                $("#user-list").append("<li id=\"" + currentUUID + "\" class=\"list-group-item  " + active + "\">" + currentUUID +"</li>");
            })
        }
    }

    // handler for TAB keypress
    $pad.on("keydown", function(e) {
        var keyCode = e.keyCode || e.which;

        if (keyCode == 9) {
            e.preventDefault();
            $pad.val($pad.val() + "    ");
        }
    });

    // When user is typing
    $pad.on('input propertychange', function(e) {
        var markdownText = $pad.val();
        $markdown.html(converter.makeHtml(markdownText));

        // trigger an event if the user is typing
        pubnub.setState({
            state: {
                isTyping: true
            },
            channels: ['markdown']
        }, function(status, response) {});
    });

    // When user is done typing for 250ms, trigger the doneTyping event handler
    $pad.on('keyup', function() {
        clearTimeout(typingTimer);
        typingTimer = setTimeout(function() {
            publishValue($pad.val());

            // trigger an event if the user is done typing
            pubnub.setState({
                state: {
                    isTyping: false
                },
                channels: ['markdown']
            }, function(status, response) {});
        }, doneTypingInterval);
    });

    // handlers for Markdown editing toolbar

    // hyperlink
    $(".link").on('mousedown', function() {
        // select the area which has the highlighted text
        var area = document.getElementById("raw-pad")

        // start and end position of highlighted text
        var startPos = area.selectionStart;
        var endPos = area.selectionEnd;

        var text = $pad.val();
        text = text.substring(0, startPos) +  "[Description text](http://) " + text.substring(startPos, text.length);
        $pad.val(text).trigger('keyup');
    });

    // image
    $(".pic").on('mousedown', function() {
        // select the area which has the highlighted text
        var area = document.getElementById("raw-pad")

        // start and end position of highlighted text
        var startPos = area.selectionStart;
        var endPos = area.selectionEnd;

        var text = $pad.val();
        text = text.substring(0, startPos) + "![Image description](http://)" + text.substring(startPos, text.length);
        $pad.val(text).trigger('keyup');
    });

    // quote
    $(".quote").on('mousedown', function() {
        // select the area which has the highlighted text
        var area = document.getElementById("raw-pad")

        // start and end position of highlighted text
        var startPos = area.selectionStart;
        var endPos = area.selectionEnd;

        var text = $pad.val();
        text = text.substring(0, startPos) + "\n> " + text.substring(startPos, text.length);
        $pad.val(text).trigger('keyup');
    });

    // unordered list
    $(".ul").on('mousedown', function() {
        // select the area which has the highlighted text
        var area = document.getElementById("raw-pad")

        // start and end position of highlighted text
        var startPos = area.selectionStart;
        var endPos = area.selectionEnd;

        var text = $pad.val();
        text = text.substring(0, startPos) + "\n* " + text.substring(startPos, text.length);
        $pad.val(text).trigger('keyup');
    });

    // ordered list
    $(".ol").on('mousedown', function() {
        // select the area which has the highlighted text
        var area = document.getElementById("raw-pad")

        // start and end position of highlighted text
        var startPos = area.selectionStart;
        var endPos = area.selectionEnd;

        var text = $pad.val();
        text = text.substring(0, startPos) + "\n1. " + text.substring(startPos, text.length);
        $pad.val(text).trigger('keyup');
    });

    // bold
    $(".bold").on('mousedown', function() {
        // select the area which has the highlighted text
        var area = document.getElementById("raw-pad")

        // start and end position of highlighted text
        var startPos = area.selectionStart;
        var endPos = area.selectionEnd;

        // add ** wrapping the selected text
        var text = $pad.val();
        text = text.substring(0, startPos) + "**" + text.substring(startPos, endPos) + "**" + text.substring(endPos, text.length);
        $pad.val(text).trigger('keyup');
    });

    // italic
    $(".italic").on('mousedown', function() {
        // select the area which has the highlighted text
        var area = document.getElementById("raw-pad")

        // start and end position of highlighted text
        var startPos = area.selectionStart;
        var endPos = area.selectionEnd;

        // add * wrapping the selected text
        var text = $pad.val();
        text = text.substring(0, startPos) + "*" + text.substring(startPos, endPos) + "*" + text.substring(endPos, text.length);
        $pad.val(text).trigger('keyup');
    });

    // horizontal line
    $(".dot").on('mousedown', function(){
        // select the area which has the highlighted text
        var area = document.getElementById("raw-pad")

        // start and end position of highlighted text
        var startPos = area.selectionStart;
        var endPos = area.selectionEnd;

        var text = $pad.val();
        text = text.substring(0, startPos) + "\n\n----------\n\n" + text.substring(startPos, text.length);
        $pad.val(text).trigger('keyup');
    });

    // code block
    $(".code").on('mousedown', function(){
        // select the area which has the highlighted text
        var area = document.getElementById("raw-pad")

        // start and end position of highlighted text
        var startPos = area.selectionStart;
        var endPos = area.selectionEnd;

        var text = $pad.val();
        text = text.substring(0, startPos) + "\n```\ninsert code here\n```\n" + text.substring(startPos, text.length);
        $pad.val(text).trigger('keyup');
    });

    // make something a header
    $(".header").on('mousedown', function() {
        // select the area which has the highlighted text
        var area = document.getElementById("raw-pad")

        // start and end position of highlighted text
        var startPos = area.selectionStart;
        var endPos = area.selectionEnd;

        // add # in the beginning the selected text
        var text = $pad.val();
        text = text.substring(0, startPos) + "#" + text.substring(startPos, text.length);
        $pad.val(text).trigger('keyup');
    });
});