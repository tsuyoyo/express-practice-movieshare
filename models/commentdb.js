/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
var database = require('./database');
var LOG = require('../debug/logutil').LOG;
var COLLECTION_NAME = 'comment_collection';
var ObjectID = require('mongodb').ObjectID;

var CommentDb = function() {
  this.db = database.createDbClient(COLLECTION_NAME);
};

/**
 * 新しいコメントを追加。
 *
 **/
CommentDb.prototype.addComment = function(videoId, userId, comment, postedDate, onAdded) {
  var newComment = {
    videoid : ObjectID.createFromHexString(videoId),
    userid  : ObjectID.createFromHexString(userId),
    comment : comment,
    postedDate : postedDate
  };
  this.db.insert(newComment, function(err, newItem) {
    if(err) {
      LOG.E(err);
    }
    onAdded(err, newItem);
  });
};

CommentDb.prototype.findAll = function(onFound) {
  this.db.find(null, function(err, comments) {
    if (err) {
      throw err;
    }
    onFound(comments);
  });
};

/**
 * Videoについているコメントを検索。
 *
 * @param videoId VideoのObjectID.
 *
 **/
CommentDb.prototype.findByVideoId = function(videoId, onFound) {
  var query = {
    videoid : videoId
  };
  this.db.find(query, function(err, comments) {
    if (err) {
      throw err;
    }
    onFound(comments);
  });
};

/**
 * Userがつけたコメントを検索。
 *
 * @param userId UserのObjectID.
 *
 **/
CommentDb.prototype.findByUserId = function(userId, onFound) {
  var query = {
    userid : userId
  };
  this.db.find(query, function(err, comments) {
    onFound(err, comments);
  });
};

/**
 * 特定のObjectIdを持つCommentを削除。
 *
 * @param commentId CommentのObjectID.
 **/
CommentDb.prototype.deleteByCommentId = function (commentId, onDeleted) {
  LOG.I('deleteByCommentId : ' + commentId.toString());
  this.db.delete( { _id : commentId }, function(err) {
    onDeleted(err);
  });
};

/**
 * 特定のVideoについたコメントを全て削除。
 *
 * @param videoId VideoのObjectID.
 **/
CommentDb.prototype.deleteByVideoId = function (videoId, onDeleted) {
  LOG.I('deleteByVideoId : ' + videoId.toString());
  this.db.delete( { videoid : videoId }, function(err) {
    onDeleted(err);
  });
};

/**
 * 特定のUserがつけたコメントを全て削除。
 *
 * @param userId UserのObjectID.
 **/
CommentDb.prototype.deleteByUserId = function (userId, onDeleted) {
  LOG.I('deleteCommentByUserId : ' + userId.toString());
  this.db.delete( { userid : userId }, function(err) {
    onDeleted(err);
  });
};

exports.createClient = function () {
  return new CommentDb();
};
