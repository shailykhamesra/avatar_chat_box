//imported dotenv file for enviorment setup, express to 
//form connection to http server, mongodb for connection to database
require('dotenv').config();
const {NODE_ENV, PORT, HOST}=process.env
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
app.use(express.static("public"));
var mongo = require('./mongo');
var socket = require('./socket');

//added variable like userCount to keep count track, count to keep click track
//db lock to know wether button is locked, lockHolder to fetch lock holder name
// lastUser to keep track of last clicked was made by which user
//var userCount=0, count=0, lock=false,  username, db, collectionName, clicks, lockHolder, lastUserName;
var count=0, db, collectionName, lastUserName;
//initialization to enable socket connection and database connection at first and fetching
//some user as well as click info on new server creation or start
initialize();

async function initialize(){
  var mongoUrl = process.env.MONGO_URL;
  var dbName = process.env.DB_NAME;
  collectionName = process.env.COLLECTION_NAME;

  //return database object
  db = await mongo.createDatabaseConnection(mongoUrl, dbName, collectionName);
  count = await getClickCount(db);
  lastUserName = await getLastUserClick(db);

  //initialize server to listen on port
  server.listen(process.env.PORT, () => {
    console.log('Server running ...');
  });

  //initialize socket connection
  lastUserName = socket.initisocketConnection(io, lastUserName);
  //fetchDbData(db);
}

function getClickCount(db){
  var db = db;
  return new Promise(resolve => {
  db.collection(collectionName).countDocuments((err, clicks) => {
    if (err) return console.log(err);
    count = clicks;
    resolve(count);
  });
});
}

function getLastUserClick(db){
  var db = db;
  return new Promise(resolve => {
  db.collection(collectionName).findOne({},{ sort: { datetime: -1 } },(err, data) => {
    data ? lastUserName = data.username: lastUserName = 'No clicks';
    resolve(lastUserName);
  });
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
function emitData(lastUserName) {
  io.emit('clickCount', count);
  if(lastUserName) {io.emit('newName', {username: lastUserName});}
}

module.exports.emitData = emitData;