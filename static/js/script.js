$(document).ready(function () {
    // References to pad and markdown elements
    var $pad = $("#raw-pad");
    var $markdown = $("#markdown");

    // Initialize Showdownjs
    var converter = new showdown.Converter();

    // Initialize PubNub
    const publishKey = "pub-c-851e2df6-cacf-487b-a0cc-39177adc1c03";
    const subscribeKey = "sub-c-18d97eee-dc04-11e6-93ca-0619f8945a4f";

    var pubnub = new PubNub({
        publishKey: publishKey,
        subscribeKey: subscribeKey
    })

    pubnub.addListener({
        message: function (message) {
            console.log(message.message);
            $pad.val(message.message);
            $markdown.html(converter.makeHtml(message.message));
        },
        status: function (status) {
            if (status.category == "PNConnectedCategory") {
                console.log("Connected successfully");
            }
        }
    });

    pubnub.subscribe({
        channels: ['markdown']
    });

    var publishValue = function (text) {
        pubnub.publish(
            {
                message: text,
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