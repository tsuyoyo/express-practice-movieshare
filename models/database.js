/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
var MongoClient = require('mongodb').MongoClient;
var LOG = require('../debug/logutil').LOG;
var DB_NAME = require('./databasename').dbName;
var MONGO_DB_URI = 'mongodb://localhost:27017/';

/*
 * Databaseのコンストラクタ。
 *
 **/
var Database = function(collectionName) {

  // DBへのconnectとdisconnectまでやる。
  this.getCollection = function(onGetCollection) {
    var onConnected = function(err, db) {
      if (err) {
        LOG.E('Failed to connect ' + err);
        throw err;
      }
      var done = function () {
        db.close();
      };
      onGetCollection(done, db.collection(collectionName));
    };
    MongoClient.connect(MONGO_DB_URI + DB_NAME, onConnected);
  };

};


/**
 * Entryを追加。
 *
 **/
Database.prototype.insert = function (newEntry, onInserted) {
  var doInsert = function(done, collection) {
    var onDbInserted = function(err, item) {
      if(err) {
        throw err;
      }
      collection.findOne(newEntry, function(err, item) {
        onInserted(null, item);
        done();
      });
    };
    collection.insert(newEntry, onDbInserted);
  };
  this.getCollection(doInsert);
};

/**
 * 要素を検索する。
 *
 **/
Database.prototype.find = function (query, onFound) {
  var doFind = function(done, collection) {
    var cursor = collection.find(query);
    var items = [];
    cursor.each(function(err, item) {
      if (err) {
        LOG.E("error happens during find : " + err);
        throw err;
      }
      if (item) {
        items.push(item);
      } else {
        LOG.I("Search is done : " + items.length + " items");
        onFound(null, items);
        done();
      }
    });
  };
  this.getCollection(doFind);
};

/**
 * 要素をUpdateする。
 *
 **/
Database.prototype.update = function (query, doc, onUpdate) {
  var doUpdate = function(done, collection) {
    collection.update(query, doc, { multi: true }, function(err, result) {
      if (err) {
        LOG.E("error happens during find : " + err);
        throw err;
      } else {
        LOG.I("Updated : " + result + " items");
        onUpdate(result);
        done();
      }
    });
  };
  this.getCollection(doUpdate);
};

/**
 * Queryに該当する要素を削除。
 *
 **/
Database.prototype.delete = function (query, onDeleted) {
  var doDelete = function(done, collection) {
    collection.remove(query, null, function(err, result) {
      if (err) {
        throw err;
      }
      onDeleted(err);
      done();
    });
  };
  this.getCollection(doDelete);
};

exports.createDbClient = function (collectionName) {
  return new Database(collectionName);
};
