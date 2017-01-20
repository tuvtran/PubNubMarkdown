# Markdown Editor

A Markdown editor utilizing PubNub's API for real-time collaborative experience

Link to test: http://www.tuvtran.com/PubNubMarkdown

## Description:

This is a super simple Markdown editor built with HTML, CSS, JavaScript (JQuery) and PubNub's API included in order for multiple users to edit the same document. The content of the document will be updated in real-time for whoever is online at the moment. However, multiple users editing a document at the same time would require the operational transformational algorithm, which takes some efforts to implement, so I simplify the application such that when one user is typing, there is a "typing indicator" and other users would know not to edit to avoid any confusions.

At the time of writing, I am using this Markdown editor. A photo is attached below to show that.

![Markdown editor](https://s24.postimg.org/x7ci2yg1h/Screen_Shot_2017_01_19_at_7_36_04_PM.png)

## Features:

### Real-time sync between users:

Originally I set the message to be sent every time the content is changed. However, that would cause a huge lag, because the latency of 100-200ms cannot guarantee a really smooth experience. Therefore, I changed the timeout to 60 and heartbeat interval to 15, and set the message to be sent **half a second after the user is done typing**.

```javascript
var doneTypingInterval = 500;   // time in ms, in this case it's 500ms

var pubnub = new PubNub({
        publishKey: publishKey,
        subscribeKey: subscribeKey,
        uuid: userID,
        presenceTimeout: 60,        // for testing only
        heartBeatInterval: 15       // for testing only   
    })
```

As a result, the overall experience is smoother, **but there are still some lags and sometimes stutterings which misplace the typing cursor**. In the future, though, I hope this caveat and obtain a more optimal performance on many clients at the same time.

### Editing toolbox:

There are **bold**, *italic*, [hyperlink](#), picture attachment, code block, quote, lists, header and horizontal line in the toolbox.

![Editing toolbox](https://s23.postimg.org/mxiysfn2z/Screen_Shot_2017_01_19_at_7_38_12_PM.png)

### Online users list:

There is an online user list. When a user is typing, there is a typing indicator.

![Typing indicator](https://s27.postimg.org/9sd6qaqlv/Screen_Shot_2017_01_19_at_7_44_21_PM.png)

## Caveats:

* As mentioned above, the typing experience is smooth but at times frustrating because of the high latency and the amount of message to be sent is too large. In the near future, I will figure out how to partition messages so that data size is reduced for each "publish".
* The editing toolbox still lacks some other necessary functions such as underline, strikethrough, making tables, custom header,...
* The typing cursor is oftentimes misplaced.
* There is no save/open file from local storage yet. However, in future updates when I set up a backend server, it will be included.

## Future updates:

* Online users' cursors like in Google Docs
* Smoother experience and lower sync time
* Custom header and code block
* Open/save file features