//imported dotenv file for enviorment setup, express to 
//form connection to http server, mongodb for connection to database
require('dotenv').config();
const { NODE_ENV, PORT, HOST } = process.env
const express = require('express');
const app = express();
var bodyParser = require('body-parser')
const server = require('http').createServer(app);
const io = require('socket.io')(server);
app.use(express.static("public"));
app.use(bodyParser.json())

var mongo = require('./mongo');
var socket = require('./socket');
const { response } = require('express');

//added variable count to keep track of clicks, db to fetch the database object from mongodb,
//collectionName to store the collection we will work on and lastUserName for last click details
var count = 0, db, collectionName, lastUserName, messageData;

//initialization to enable socket connection and database connection at first and fetching
//some user as well as click info on new server creation or start
initialize();

async function initialize() {
  var mongoUrl = process.env.MONGO_URL;
  var dbName = process.env.DB_NAME;
  collectionName = process.env.COLLECTION_NAME;

  //return database object
  db = await mongo.createDatabaseConnection(mongoUrl, dbName, collectionName);
  count = await getClickCount(db);
  lastUserName = await getLastUserClick(db);
  //messageData = await getMessageData(db);

  //initialize server to listen on port
  server.listen(process.env.PORT, () => {
    console.log('Server running ...');
  });

  //initialize socket connection
  socket.initSocketConnection(io, lastUserName);
}

function getClickCount(db) {
  var db = db;
  return new Promise(resolve => {
    db.collection(collectionName).countDocuments((err, clicks) => {
      if (err) return console.log(err);
      count = clicks;
      resolve(count);
    });
  });
}

function getLastUserClick(db) {
  var db = db;
  return new Promise(resolve => {
    db.collection(collectionName).findOne({}, { sort: { created_at: -1 } }, (err, data) => {
      data ? lastUserName = data.username : lastUserName = 'No message sent';
      resolve(lastUserName);
    });
  });
}

//fetching the initial serving page to the users
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

//adding message document entry in database to keep a record of the sent message made and  which user 
//made the message and at which date and if api call fails then dont update the message made and emit previous
//data
app.post('/clicked', (req, res) => {
  const click = {
    created_at: new Date(), username: req.body.username,
    message: req.body.message, avatar: req.body.avatar
  };
  db.collection(collectionName).insertOne(click, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      updateLocalCount();
    }
    lastUserName = req.body.username;
    emitData();
    res.sendStatus(200);
  });
});

app.get('/data', (req, res) => {
  db.collection(collectionName).find({}).toArray(function(err, data) {
    if (err) {
      console.log(err);
    } else {
      res.send(data);
    }
  });
});


//locally increase the count of messages if the sent is clicked onto the system to reduce load on api call
function updateLocalCount() {
  count++;
};

//emit real time details using socket about message counts and last message sent by which user
function emitData() {
  io.emit('clickCount', count);
  io.emit('newName', { username: lastUserName });
}

module.exports.emitData = emitData;
