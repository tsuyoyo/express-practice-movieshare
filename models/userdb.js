/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
var database = require('./database');
var LOG = require('../debug/logutil').LOG;
var COLLECTION_NAME = 'user_collection';

var UserDb = function() {
  this.db = database.createDbClient(COLLECTION_NAME);
};

/**
 * 新しいユーザを追加する
 *
 **/
UserDb.prototype.register = function (username, mail, team, type, onInserted) {

  var self = this;
  var newUser = {
    name : username,
    mail : mail,
    team : team,
    type : type
  };

  self.db.insert(newUser, function(err, user) {
    if (err) {
      LOG.E(err);
    }
    onInserted(user);
  });
};

var doFind = function (db, query, onFound) {
  db.find(query, function(err, users) {
    if (err) {
      LOG.E(err);
    }
    if (users && 0 < users.length) {
      onFound(users[0]);
    } else {
      LOG.W('User was not found');
      onFound(null);
    }
  });
};

/**
 * Find by user's name.
 *
 **/
UserDb.prototype.findByName = function (userName, onFound) {
  var query = {
    name : userName
  };
  doFind(this.db, query, onFound);
};

/*
 * Idが一致するUserを検索する
 *
 * @userId ObjectID for the user.
 **/
UserDb.prototype.findById = function (userId, onFound) {
  var query = {
    _id : userId
  };
  doFind(this.db, query, onFound);
};

/**
 * Mailに一致するuserを検索する
 *
 **/
UserDb.prototype.findByMail = function (mail, onFound) {
  var query = {
    mail : mail
  };
  doFind(this.db, query, onFound);
};

/**
 * 全てのUserを検索する
 *
 **/
UserDb.prototype.findAll = function (onFound) {
  this.db.find(null, function(err, users) {
    if (err) {
      LOG.E(err);
    }
    onFound(users);
  });
};

/**
 * Delete a specific user by its ID.
 *
 **/
UserDb.prototype.deleteById = function (userId, onDeleted) {
  this.deleteByIdList([userId], onDeleted);
};

UserDb.prototype.deleteByIdList = function (userIds, onDeleted) {
  var idQueris = new Array(userIds.length);
  for (var i = 0; i<userIds.length; i++) {
    idQueris[i] = { _id : userIds[i] };
  }
  this.db.delete( { $or:idQueris }, function (err) {
    onDeleted(err);
  });
};

/**
 * Delete a specific named user.
 *
 **/
UserDb.prototype.deleteByName = function (userName, onDeleted) {
  this.db.delete( { name : userName }, function (err) {
    onDeleted(err);
  });
};

exports.createClient = function () {
  return new UserDb();
};
