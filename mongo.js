const mongodb = require('mongodb');

function createDatabaseConnection(url, db, collectionName){
  var dbName = db, collectionName = collectionName;
  return new Promise(resolve => {
    try{
      const client = new mongodb.MongoClient(url,{useUnifiedTopology: true});
      client.connect();
      var db = client.db(dbName);
      db.createCollection(collectionName);
      resolve(db);
    }catch(e){
      console.log(e);
      process.exit(1);
    }
  });
}

module.exports.createDatabaseConnection = createDatabaseConnection;