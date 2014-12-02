/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
var CommentDb = require('../models/commentdb').createClient();
var VideoDb = require('../models/videodb.js').createClient();
var ObjectID = require('mongodb').ObjectID;
var LOG = require('../debug/logutil').LOG;

exports.find = function (req, res) {

  var onFound = function(comments) {
    if (comments) {
      res.send(200, { comments : comments });
    } else {
      res.send(200, { comments : [] });
    }
  };

  if (req.params.videoid) {
    CommentDb.findByVideoId(ObjectID(req.params.videoid), onFound);
  } else {
    CommentDb.findAll(onFound);
  }

};

/**
 * コメントを投稿（下記のデータ構造をPOSTで受け取る）。
 *
 * { videoid : ObjectID of the video,
 *   userid : ObjectID of the user,
 *   comment : What's inserted in beforeEach,
 *   postedDate : date }
 *
 */
exports.submit = function (req, res) {
  var onAdded = function(err, newComment) {
    if (err) {
      res.send(400);
    } else {
      res.send(200, { comment : newComment });
    }
  };
  VideoDb.findById(ObjectID(req.body.videoid), function(video) {
    if (video) {
      CommentDb.addComment(
        req.body.videoid,
        req.body.userid,
        req.body.comment,
        req.body.postedDate,
        onAdded);
    } else {
      res.send(400, { errMsg : 'Submitted comment to unregistered video' });
    }
  });
};

exports.deleteById = function (req, res) {
  var commentId = ObjectID(req.params.commentid);
  CommentDb.deleteByCommentId(commentId, function(err) {
    if (err) {
      LOG.E('delete error :' + err);
    }
    res.send(200);
  });
};

exports.deleteByUserId = function (req, res) {
  var userId = ObjectID(req.params.userid);
  CommentDb.deleteByUserId(userId, function(err) {
    if (err) {
      LOG.E('delete by user error : ' + err);
    }
    res.send(200);
  });
};
