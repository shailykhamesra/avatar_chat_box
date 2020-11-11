const mongodb = require('mongodb');
var db;

function createDatabaseConnection(url, db, collectionName){
  var dbName = db, collectionName = collectionName;
  return new Promise(resolve => {
    try{
      const client = new mongodb.MongoClient(url,{useUnifiedTopology: true});
      client.connect();
      db = client.db(dbName);
      db.createCollection(collectionName, function(err, collection) {
          if(err) {
            console.log("Collection " + collectionName + " already created");
          }
        });
      resolve(db);
    }catch(e){
      console.log(e);
      process.exit(1);
    }
  });
}

module.exports.createDatabaseConnection = createDatabaseConnection;