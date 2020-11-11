var app = require('./app');

//added variable like userCount to keep count track, count to keep click track
//db lock to know wether button is locked, lockHolder to fetch lock holder name
// lastUser to keep track of last clicked was made by which user
var userCount = 0, count = 0, lock = false, username, clicks, lockHolder, lastClickByUser, messageData;

function initSocketConnection(io) {
  io.sockets.on('connection', function (socket) {
    //username creation for the socket created on the system
    username = Math.random().toString(36).substring(7);
    socket.username = username;
    userCount++;

    //socket emit data about the current count of message sent and user who sent last message
    app.emitData();

    //socket emit data to client side about the new user to all existing user and about the current
    //count of messages to the newly entered user
    socket.emit('newUserConnect', { username: socket.username });
    io.sockets.emit('userCount', { userCount: userCount, username: socket.username });

    //if the lock is made by some other user than the user user now comming onto the system should have 
    //the avatar disabled
    if (lock) {
      socket.emit('lockButton');
    } else {
      socket.emit('enableAvatar');
    }

    //if some user decides to leave the system then the current user count on system should be modified and
    //if the user leaving system has lock with it then all other user avatar should be enabled to protect
    //deadlock situation
    socket.on('disconnect', function () {
      userCount--;
      if (socket.username == lockHolder) {
        io.sockets.emit('unlockButton');
        lockHolder = null;
        lock = false;
      }

      io.sockets.emit('userCount', { userCount: userCount });
    });

    //broadcasting to all other user except the user who perfroms action about the avatar being disabled
    socket.on('disableAvatar', function (data) {
      lockHolder = socket.username;
      lock = data;
      socket.broadcast.emit('lockButton');
    });

    //broadcasting to all other user except the user who perfroms action about the avatar being enabled
    socket.on('enableButton', function (data) {
      lockHolder = null;
      lock = data;
      socket.broadcast.emit('unlockButton');
    });

    socket.on('chat', function (message, avatar, timestamp) {
      let timeValue = timestamp.split('GMT').shift()
      io.sockets.emit('broadcast', message, avatar, timeValue);
    });

  });
}

module.exports.initSocketConnection = initSocketConnection;
