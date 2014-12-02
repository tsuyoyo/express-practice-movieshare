/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
var database = require('./database');
var LOG = require('../debug/logutil').LOG;
var ObjectID = require('mongodb').ObjectID;

/**
 * Base class of markings (category, tag)
 *
 * @param db MongoDB object.
 *
 **/
exports.MarkDbBase = function(collectionName) {

  var db = database.createDbClient(collectionName);

  /**
   * Insert the new mark to DB
   *
   * @param markName
   * @param isPublic false when the mark is visible only by admin
   * @param onAdded  callback with an inserted mark object
   **/
  this.add = function(markName, isPublic, onAdded) {
    var onInserted = function(err, markObj) {
      if(err) {
        LOG.E(err);
      }
      onAdded(markObj);
    };

    var query = {
      name   : markName,
      public : isPublic,
      createdDate : (new Date()).getTime()
    };

    db.insert(query, onInserted);
  };

  /**
   * Find specific mark from database.
   * The mark instance will be called back to onFound.
   * When the mark couldn't find, null will be passed.
   *
   * To get data structure of mark, please see add() method.
   *
   * @params objId   ObjectID of the mark.
   * @params onFound Callback to recieve the found mark instance.
   */
  this.get = function(markObjId, onFound) {

    var callback = function(err, marks) {
      if (err) {
        LOG.E(err);
      }

      var foundMark = null;
      if (marks && 0 < marks.length) {
        foundMark = marks[0];
      }

      onFound(foundMark);
    };

    var query = { _id : markObjId };

    db.find(query, callback);
  };

  /**
   * Found all marks registered in database.
   *
   * @params onFound Callback to recieve found categories.
   */
  this.getAll = function(onFound) {

    var callback = function(err, marks) {
      if (err) {
        LOG.E(err);
      }
      onFound(marks);
    };

    var query = null;
    db.find(query, callback);
  };

  /**
   * Found all "public" marks registered in database.
   *
   * @params onFound Callback to recieve found public categories.
   */
  this.getPublicAll = function(onFound) {
    var callback = function(err, categories) {
      if (err) {
        LOG.E(err);
      }
      onFound(categories);
    };

    var query = { public : "true" };

    db.find(query, callback);
  };

  /**
   * Delete specific mark from database.
   *
   * @params markObjId ObjectID to delete from DB.
   */
  this.delete = function(markObjId, onDeleted) {
    var callback = function(err) {
      if (err) {
        LOG.E(err);
      }
      onDeleted();
    };

    var query = { _id : markObjId };
    db.delete(query, callback);
  };

};

