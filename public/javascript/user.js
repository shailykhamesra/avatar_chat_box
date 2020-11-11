//send button api listener to send api request from client side and receive response from server side
const button = document.getElementById('myButton');
$("#myButton").click(function(event) {
  event.preventDefault();
  var message = $("#chatForm #chat-input").val();
  if(!message){
    document.getElementById("error").innerHTML = "Enter message content";
    return;
  }
  let timestamp = new Date();
  socket.emit('chat', message, avatarLogo, String(timestamp));
  fetch('/clicked', {method: 'POST', body: JSON.stringify({username: username, message: message,
     avatar: avatarLogo, timestamp: timestamp}), headers: { 'Content-Type': 'application/json' }})
    .then(function(response) {
      if(response.ok) {
        $('.emojionearea-editor').text("");
        $("#error").innerHTML="";
        return;
      }
      throw new Error('Request failed.');
    })
    .catch(function(error) {
      console.log(error);
    });
});

