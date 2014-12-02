/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
var database = require('./database');
var LOG = require('../debug/logutil').LOG;
var COLLECTION_NAME = 'like_collection';

var LikeDb = function() {
  this.db = database.createDbClient(COLLECTION_NAME);
};

/**
 * Likeの数を増やす
 *
 * @param videoId VideoのObjectId
 * @param userId  UserのObjectId
 **/
LikeDb.prototype.addLike = function(videoId, userId, onAdded) {
  var self = this;
  var query = {
    videoid : videoId,
    userid : userId
  };
  self.db.find(query, function(err, like) {
    if (0 === like.length) {
      self.db.insert(query, function(err, likeId) {
        if (err) {
          LOG.E('Failed to add like : ' + err.toString());
        }
        // addしたらlikeの数を検索してcallbackする。
        self.likeNum(videoId, onAdded);
      });
    } else {
      // すでにそのユーザがlikeしていた場合。
      // likeの数を検索してcallback。
      LOG.W(userId.toString + " has already tapped like");
      self.likeNum(videoId, onAdded);
    }
  });
};

/**
 * Likeの数を減らす
 *
 * @param videoId VideoのObjectId
 * @param userId  UserのObjectId
 **/
LikeDb.prototype.subLike = function(videoId, userId, onSubtracted) {
  var self = this;
  var query = {
    videoid : videoId,
    userid : userId
  };
  self.db.delete(query, function(err) {
    if (err) {
      LOG.W('Error happend in subLike : ' + err);
    }
    self.likeNum(videoId, onSubtracted);
  });
};

/**
 *
 *
 **/
LikeDb.prototype.clearLikes = function(videoId, onClear) {
  var self = this;
  var query = {
    videoid : videoId
  };
  self.db.delete(query, function(err) {
    self.likeNum(videoId, onClear);
  });
};

/**
 * Userがそのvideoに対してLikeを押していたか
 *
 * @param videoId VideoのObjectId
 * @param userId  UserのObjectId
 **/
LikeDb.prototype.hasLiked = function(videoId, userId, callback) {
  var self = this;
  var query = {
    videoid : videoId,
    userid : userId
  };
  self.db.find(query, function(err, likes) {
    if (err) {
      LOG.W('Error happend in doesLike : ' + err);
    }
    if (likes && 0 < likes.length) {
      callback(true);
    } else {
      callback(false);
    }
  });
};

/**
 *
 *
 **/
LikeDb.prototype.find = function(videoId, onFound) {
  var self = this;
  var query = {
    videoid : videoId
  };
  self.db.find(query, function(err, likes) {
    var res = likes;
    if (err) {
      LOG.W('LikeDb find error : ' + err);
    }
    onFound(res);
  });
};


/**
 * そのVideoに対してついているLikeの数
 *
 * @param videoId VideoのObjectId
 **/
LikeDb.prototype.likeNum = function(videoId, callback) {
  var self = this;
  var query = {
    videoid : videoId
  };
  self.db.find(query, function(err, likes) {
    var res;
    if (!err && likes) {
      res = likes.length;
    } else if (err) {
      LOG.W('LikeDb likeNum error : ' + err);
      res = 0;
    } else if (!likes) {
      res = 0;
    }
    callback(res);
  });
};

/**
 * そのユーザがlikeしたvideoのIDを検索
 *
 * @param userId UserのObjectId
 **/
LikeDb.prototype.likeVideos = function(userId, callback) {
  var self = this;
  var query = {
    userid : userId
  };
  self.db.find(query, function(err, likes) {
    var res;
    if (err) {
      LOG.E('LikeDb likeVideos error : ' + err);
    }
    callback(likes);
  });
};

exports.createClient = function () {
  return new LikeDb();
};

