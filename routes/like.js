/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
var LikeDb = require('../models/likedb').createClient();
var ObjectID = require('mongodb').ObjectID;

exports.numberOfLikes = function (req, res) {
  var videoId = ObjectID(req.params.videoid);
  LikeDb.likeNum(videoId, function(num) {
    res.send(200, { likesNum : num });
  });
};

exports.like = function (req, res) {
  var videoId = ObjectID(req.params.videoid);
  var userId = ObjectID(req.params.userid);
  LikeDb.addLike(videoId, userId, function(num) {
    res.send(200, {likesNum : num});
  });
};

exports.cancelLike = function (req, res) {
  var videoId = ObjectID(req.params.videoid);
  var userId = ObjectID(req.params.userid);
  LikeDb.subLike(videoId, userId, function(num) {
    res.send(200, {likesNum : num});
  });
};

exports.hasLiked = function (req, res) {
  var videoId = ObjectID(req.params.videoid);
  var userId = ObjectID(req.params.userid);
  LikeDb.hasLiked(videoId, userId, function(liked) {
    res.send(200, {hasLiked : liked});
  });
};

