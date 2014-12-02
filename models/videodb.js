/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
var database = require('./database');
var LOG = require('../debug/logutil').LOG;
var COLLECTION_NAME = 'video_collection';

var VideoDb = function() {
  this.db = database.createDbClient(COLLECTION_NAME);
};

/**
 * 新しいVideoを追加。
 * userNameは、登録したユーザのname。
 *
 **/
VideoDb.prototype.add = function(videoPath, title, thumbnailPath,
  userId, date, tagId, categoryId, onAdded) {

  var newVideo = {
    video : videoPath,
    title : title,
    thumbnail : thumbnailPath,
    userid : userId,
    postedDate : date,
    categoryid : categoryId
  };
  if (tagId) {
    newVideo.tagid = tagId;
  }

  this.db.insert(newVideo, function(err, addedVideo) {
    if(err) {
      LOG.E(err);
    }
    onAdded(addedVideo);
  });
};

/**
 * 特定のユーザの投稿したVideoを検索する
 *
 **/
VideoDb.prototype.findByUserId = function (userId, onFound) {
  var query = {
    userid : userId
  };
  this.findVideosByQuery(query, onFound);
};

/**
 * Search by tag ID.
 *
 **/
VideoDb.prototype.findByTag = function(tagId, onFound) {
  var query = {
    tagid : tagId
  };
  this.findVideosByQuery(query, onFound);
};

/**
 * Search by category ID.
 *
 **/
VideoDb.prototype.findByCategory = function(categoryId, onFound) {
  var query = {
    categoryid : categoryId
  };
  this.findVideosByQuery(query, onFound);
};


/**
 * IDで検索。
 *
 **/
VideoDb.prototype.findById = function (objectId, onFound) {
  var query = {
    _id : objectId
  };
  this.db.find(query, function(err, videos) {
    if (err) {
      LOG.E(err);
    }
    if (videos && 0 < videos.length) {
      onFound(videos[0]);
    } else {
      onFound(null);
    }
  });
};

/**
 * 投稿された全てのVideoを検索する
 *
 **/
VideoDb.prototype.findAll = function (onFound) {
  this.db.find(null, function(err, videos) {
    if (err) {
      LOG.E(err);
    }
    onFound(videos);
  });
};

/**
 * 特定のObjectIdを持つVideoを削除。
 *
 **/
VideoDb.prototype.delete = function (videoId, onDeleted) {
  this.db.delete( { _id : videoId }, function(err) {
    if (err) {
      LOG.E(err);
    }
    onDeleted();
  });
};

/**
 * 特定のユーザがuploadしたVideoを削除。
 *
 **/
VideoDb.prototype.deleteByUserId = function (userId, onDeleted) {
  var query = { userid : userId };
  this.deleteVideosByQuery(query, onDeleted);
};

/**
 *
 *
 **/
VideoDb.prototype.deleteByTag = function (tagId, onDeleted) {
  var query = { tagid : tagId };
  this.deleteVideosByQuery(query, onDeleted);
};

/**
 *
 *
 **/
VideoDb.prototype.deleteByCategory = function (categoryId, onDeleted) {
  var query = { categoryid : categoryId };
  this.deleteVideosByQuery(query, onDeleted);
};

/**
 * TODO : No intention to publish out of this file.
 *
 **/
VideoDb.prototype.findVideosByQuery = function(query, callback) {
  this.db.find(query, function(err, videos) {
    if (err) {
      LOG.E(err);
    }
    callback(videos);
  });
};

/**
 * TODO : No intention to publish out of this file.
 *
 **/
VideoDb.prototype.deleteVideosByQuery = function(query, callback) {
  this.db.delete(query, function(err, videos) {
    if (err) {
      LOG.E(err);
    }
    callback(videos);
  });
};

exports.createClient = function () {
  return new VideoDb();
};
