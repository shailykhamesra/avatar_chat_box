require('dotenv').config();
const {NODE_ENV, PORT, HOST}=process.env
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
app.use(express.static("public"));

var count=0, clicks;

initialize();

function initialize(){
  initDatabaseAndStartServer();
}


function initDatabaseAndStartServer(){
  const url = process.env.MONGO_URL;
  MongoClient.connect(url, {useUnifiedTopology: true},(err, database) => {
    if(err) {
      console.log(err);
      return;
    }
    db = database.db('clickinfo');

    db.collection('clicks').countDocuments((err, clicks) => {
      if (err) return console.log(err);
      count = clicks;
    });

    db.collection('clicks').findOne({},{ sort: { datetime: -1 } },(err, data) => {
      lastUserName = data.username;
    });

    server.listen(process.env.PORT, () => {
      console.log('Server running ...');
    });

  });
}

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/clicked', (req, res) => {
  const click = {clickTime: new Date(), username: lastUserName};
  db.collection('clicks').insertOne(click, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      updateLocalCount();
    }
    res.sendStatus(200);
  });
});

function updateLocalCount() {
  count++;
};



