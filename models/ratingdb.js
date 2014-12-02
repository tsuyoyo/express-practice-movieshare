/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
var database = require('./database');
var LOG = require('../debug/logutil').LOG;
var COLLECTION_NAME = 'rating_collection';

var RatingDb = function() {
  this.db = database.createDbClient(COLLECTION_NAME);
};

// rating should be stringfied JSON object
RatingDb.prototype.add = function(videoId, rating, onAdded) {
  var self = this;
  var query = {
    videoid : videoId,
    rating : rating
  };
  self.db.insert(query, function(err, addedRating) {
    if (err) {
      LOG.E('Failed to add like : ' + err.toString());
    }
    onAdded(addedRating);
  });
};

RatingDb.prototype.delete = function(ratingId, onDeleted) {
  var self = this;
  var query = {
    _id : ratingId
  };
  self.db.delete(query, function(err) {
    if (err) {
      LOG.W('Error happend in delete : ' + err);
    }
    onDeleted();
  });
};

RatingDb.prototype.find = function(videoId, onFound) {
  var self = this;
  var query = {
    videoid : videoId
  };
  self.db.find(query, function(err, ratings) {
    if (err) {
      LOG.W('RatingDb find error : ' + err);
    }
    if (0 < onFound.length) {
      onFound(ratings[0]);
    } else {
      onFound(null);
    }
  });
};

exports.createClient = function () {
  return new RatingDb();
};

