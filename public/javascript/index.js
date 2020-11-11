var enabled = true, avatarLogo;
var socket = io.connect();

$(document).ready(function () {
    $("#chat-input").emojioneArea({
        pickerPosition: "bottom"
    });
});

//showing real time active user count on the system
socket.on('userCount', function (data) {
    $('#getCount').html('Currently active socket connections: ' + data.userCount);
})

//showing welcome message to the newly created user only
socket.on('newUserConnect', function (data) {
    username = data.username;
    $('#currentUser').html('<h1> Welcome ' + data.username + ' !</h1>');
    fetch('/data', {
        method: 'GET', headers: { 'Content-Type': 'application/json' }
    })
        .then(function (response) {
            if (response.ok) {
                response.json().then(body => {
                    let resp = body;
                    var messageCount = resp.length, message = 0;
                    console.log(messageCount);

                    for (message = 0; message != messageCount; message++) {
                        data = resp[message];
                        let timeValue = String(new Date(data.created_at)).split('GMT').shift()
                        messageAddition(data.message, data.avatar, timeValue);
                    }
                    return;
                });
            }
            throw new Error('Request failed.');
            })
        .catch(function (error) {
            console.log(error);
        });
});

//showing real time message counts on the system and fetching it in real time with message sent
socket.on('clickCount', function (data) {
    $('#clicks').html('Message count: ' + data);
});

//showing real time information about the username who sent last message
socket.on('newName', function (data) {
    $('#getName').html('Last message sent by : ' + data.username);
});


//locking button if any user tries to lock all other users on the system by choosing avatar
socket.on('lockButton', function (data) {
    document.getElementById("avatarImage").style.visibility = 'hidden';
    document.getElementById("chatScreen").style.visibility = 'visible';
    document.getElementById("chatForm").style.display = 'none';
});

//unlocking button if the user who locked tries to unlock all other users on the system by closing tab
socket.on('unlockButton', function (data) {
    document.getElementById("avatarImage").style.visibility = 'visible';
    document.getElementById("chatScreen").style.visibility = 'hidden';
});

//enabling avatar if no user is holding lock currently
socket.on('enableAvatar', function (data) {
    document.getElementById("avatarImage").style.visibility = 'visibility';
    document.getElementById("chatScreen").style.visibility = 'hidden';
});

//broadcast message to all users present actively
socket.on('broadcast', function (data, avatar, timestamp) {
    messageAddition(data, avatar, timestamp);
});

//toggel lock value between lock and unlock and update html text for button on
//conditional basis
function lockButton(data) {
    var avatar = document.getElementById("avatarImage");
    const messageBox = document.getElementById("chatForm");
    if (enabled) {
        socket.emit('disableAvatar', enabled);
        avatarLogo = data.getAttribute("src");
        avatar.innerHTML = "<img src=\"" + avatarLogo + "\" class=\"avatar\">";
        document.getElementById("chatScreen").style.visibility = 'visible';
        document.getElementById("chatForm").style.display = 'block';
        messageBox.style.visibility = 'visible';
        $('#message').html('<h1> hi ' + data.username + ' !</h1>');
    } else {
        avatar.innerHTML = 'Lock';
        socket.emit('enableButton', enabled);
        enabled = true;
    }
}

//message addition for all users
function messageAddition(data, avatar, timestamp) {
    let text = $("<label class=\"content\">", {});
    text.text(data);
    let image = $("<img src=\"" + avatar + "\" class=\"avatar\">", {});
    let timeValue = $("<label class=\"timestamp\">", {});
    timeValue.text(timestamp);
    let div = $("<div>", { class: "contain" });
    div.append(image);
    div.append(text);
    div.append(timeValue);
    $("#chat-window").append(div);
    var content = document.getElementById("chat-window");
    content.scrollTop = content.scrollHeight - content.clientHeight;
}



