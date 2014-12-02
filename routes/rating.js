/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
var RatingDb = require('../models/ratingdb').createClient();
var ObjectID = require('mongodb').ObjectID;

exports.add = function (req, res) {
  var videoId = ObjectID(req.body.videoid);
  var rating = req.body.rating;

  RatingDb.add(videoId, rating, function(addedRating) {
    res.send(200, { rating : addedRating });
  });
};

exports.delete = function (req, res) {
  var ratingId = ObjectID(req.params.ratingid);

  RatingDb.delete(ratingId, function() {
    res.send(200);
  });
};

exports.find = function (req, res) {
  var videoId = ObjectID(req.params.videoid);

  RatingDb.find(videoId, function(data) {
    res.send(200, { rating : JSON.parse(data.rating) });
  });
};

