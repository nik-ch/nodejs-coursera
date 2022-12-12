const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const dbOper = require('./operations');

const url = 'mongodb://localhost:27017/';
const dbName = 'confusion';

MongoClient.connect(url).then(client => {
  console.log('Connected to the server');
  const db = client.db(dbName);
  dbOper.insertDocument(db, {name: 'New item 1', description: 'Item 1 descr'},'dishes')
  .then(res => {
    console.log(`Insertion callback: ${res.ops}`);
    return dbOper.findDocuments(db, 'dishes');
  }).then(docs => {
    console.log(`Found documents: ${docs}`);
    return dbOper.updateDocument(db, {name: 'New item 1'}, {description: 'Updated description'}, 'dishes');
  }).then(res => {
    console.log(`Updated document: ${res.result}`);
    return dbOper.findDocuments(db, 'dishes');
  }).then(docs => {
    console.log(`Found documents: ${docs}`);
    return db.dropCollection('dishes');
  }).then(res => {
    console.log('Dropped collection');
    client.close();
  });
}).catch(err => console.log(err));
