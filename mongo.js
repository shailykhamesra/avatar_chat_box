const mongodb = require('mongodb');

function initDatabaseAndStartServer(url, db, collectionName){
  var dbName = db, collectionName = collectionName;
  return new Promise(resolve => {
    const client = new mongodb.MongoClient(url,{useUnifiedTopology: true});
    client.connect((err) => {
      if (!err) {
        console.log('connection created');
      }
      var db = client.db(dbName);
      db.createCollection(collectionName);
      resolve(db);
    });
  });
}

module.exports.initDatabaseAndStartServer = initDatabaseAndStartServer;