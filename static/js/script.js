$(document).ready(function () {
    // References to pad and markdown elements
    var $pad = $("#raw-pad");
    var $markdown = $("#markdown");

    // Initialize Showdownjs
    var converter = new showdown.Converter();

    // Initialize PubNub
    const publishKey = "pub-c-851e2df6-cacf-487b-a0cc-39177adc1c03";
    const subscribeKey = "sub-c-18d97eee-dc04-11e6-93ca-0619f8945a4f";

    // user list
    var users = [];

    // generate a unique user id
    var userID = 'user' + (Math.floor(Math.random() * 100) + 1).toString();

    var pubnub = new PubNub({
        publishKey: publishKey,
        subscribeKey: subscribeKey,
        uuid: userID
    })

    pubnub.addListener({
        message: function(obj) {
            console.log(obj);
            $pad.val(obj.message.such);
            $markdown.html(converter.makeHtml(obj.message.such));
        },
        status: function(status) {
            if (status.category == "PNConnectedCategory") {
                console.log("Connected successfully");
            }
        },
        presence: function(event) {
            var uuid = event.uuid;
            if (event.action == "join") {
                users.push(uuid);
                $("#user-list").append("<li class=\"" + uuid + "\">" + uuid + "</li>");
                console.log("new user added " + event.uuid);
            } else if (event.action == "leave") {
                console.log("user left " + event.uuid);
                $("#user-list").remove("#" + uuid);
                users.splice(users.indexOf(event.uuid), 1);
            }
            console.log(users);
        }
    });

    pubnub.subscribe({
        channels: ['markdown'],
        withPresence: true
    });

    var publishValue = function (text) {
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

    var convertTextAreaToMarkdown = function () {
        var markdownText = $pad.val();
        publishValue(markdownText);
    }

    $pad.on('change paste keyup', convertTextAreaToMarkdown);
});