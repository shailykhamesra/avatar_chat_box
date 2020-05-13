//imported dotenv file for enviorment setup, express to 
//form connection to http server, mongodb for connection to database
require('dotenv').config();
const {NODE_ENV, PORT, HOST}=process.env
const express = require('express');
const app = express();
const mongodb = require('mongodb');
const server = require('http').createServer(app);
const io = require('socket.io')(server);
app.use(express.static("public"));
var mongo = require('./mongo.js');

//added variable like userCount to keep count track, count to keep click track
//db lock to know wether button is locked, lockHolder to fetch lock holder name
// lastUser to keep track of last clicked was made by which user
var userCount=0, count=0, lock=false,  username, db, collectionName, clicks, lockHolder, lastUserName;

//initialization to enable socket connection and database connection at first and fetching
//some user as well as click info on new server creation or start
initialize();

async function initialize(){
  var mongoUrl = process.env.MONGO_URL;
  var dbName = process.env.DB_NAME;
  collectionName = process.env.COLLECTION_NAME;

  //return database object
  db = await mongo.createDatabaseConnection(mongoUrl, dbName, collectionName);
  
  //initialize server to listen on port
  server.listen(process.env.PORT, () => {
    console.log('Server running ...');
  });

  //initialize socket connection
  initisocketConnection();
  fetchDbData(db);
}

//create socket connection for broadcasting details to client sise from server side and update about 
//each change made on client side to each prevaling user onto the system in real time 
function initisocketConnection(){
  io.sockets.on('connection', function(socket) {
    //username creation for the socket created on the system
    username = Math.random().toString(36).substring(7);
    socket.username = username;
    userCount++;
    //socket emit data about the current count of clicks and user who made last click
    emitData();
    //socket emit data to client side about the new user to all existing user and about the current
    //count of clicks to the newly entered user
    socket.emit('newUserConnect',{ username: socket.username});
    io.sockets.emit('userCount',{ userCount: userCount, username: socket.username});
    socket.emit('clickCount', count);
  
    //if the lock is made by some other user than the user user now comming onto the system should have 
    //the click button disabled
    if(lock){
      socket.emit('lockButton');
    }
     
    //if some user decides to leave the system then the current user count on system should be modified and
    //if the user leaving system has lock with it then all other user button should be enabled to protect
    //deadlock situation
    socket.on('disconnect', function() {
      userCount--;
      if(socket.username == lockHolder){
        io.sockets.emit('unlockButton');
        lockHolder = null;
        lock = false;
      }

      io.sockets.emit('userCount' ,{ userCount: userCount});
    });
    
    //socket to emit current user name having last click
    socket.on('sendName', function(){
      lastUserName = socket.username;
      io.sockets.emit('newName' ,{username: socket.username});
    });

    //broadcasting to all other user except the user who perfroms action about the button being disabled
    socket.on('disableButton', function(data){
      lockHolder = socket.username;
      lock = data;
      socket.broadcast.emit('lockButton');
    });
    
    //broadcasting to all other user except the user who perfroms action about the button being enabled
    socket.on('enableButton', function(data){
      lockHolder = null;
      lock = data;
      socket.broadcast.emit('unlockButton');
    });
  });
}

//fetch initial data from the database when new server session starts, details like user click count and 
//user who performed the last click 
function fetchDbData(db){
  db.collection(collectionName).countDocuments((err, clicks) => {
    if (err) return console.log(err);
    count = clicks;
  });

  db.collection(collectionName).findOne({},{ sort: { datetime: -1 } },(err, data) => {
    data ? lastUserName = data.username: lastUserName = 'No clicks';
  });
}

//fetching the initial serving page to the users
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

//adding click document entry in database to keep a record of the click made and who as is which user 
//made the click and at which date and if api call fails then dont update the click made and emit previous
//data
app.post('/clicked', (req, res) => {
  const click = {clickTime: new Date(), username: lastUserName};
  db.collection(collectionName).insertOne(click, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      updateLocalCount();
    }
    emitData();
    res.sendStatus(200);
  });
});

//locally increase the count of clicks if the click is saved onto the system to reduce load on api call
function updateLocalCount() {
  count++;
};

//emit real time details using socket about click counts and last click made by which user
function emitData() {
  io.emit('clickCount', count);
  io.emit('newName', {username: lastUserName});
}
