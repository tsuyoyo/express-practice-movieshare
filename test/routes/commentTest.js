/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
var should = require('should');
var request = require('supertest');
var DEBUG_LOG = require('../../debug/logutil').DEBUG_LOG;
var CommentDb = require('../../models/commentdb').createClient();
var VideoCategoryDb = require('../../models/videocategorydb').createClient();
var VideoDb = require('../../models/videodb').createClient();
var ObjectID = require('mongodb').ObjectID;
var app = require('../../app');

describe('comment.js', function() {

  // Common dummy data.
  var dummyVideoIds = ['DummyVideo01', 'DummyVideo02', 'DummyVideo03'];
  var dummyUserIds = ['DummyUser001', 'DummyUser002', 'DummyUser003'];

  // Urls for each API.
  var API = {
    find : function(dummyVideoId) {
      return '/comment/find/' + dummyVideoId;
    },
    submit : function() {
      return '/comment/submit';
    },
    deleteById : function(commentId) {
      return '/comment/delete/' + commentId;
    },
    deleteByUserId : function(userId) {
      return '/comment/deleteByUserId/' + userId;
    }
  };

  // comment data structure is below,
  // { videoId : xxx, userId : yyy, comment : zzz, postedDate : 123 }
  var addCommentToDatabase = function(commentData, callback) {
    var videoObjId = ObjectID(commentData.videoId).toHexString();
    var userObjId = ObjectID(commentData.userId).toHexString();
    var postedDate = commentData.postedDate;
    var comment = commentData.comment;
    var onAdded = function (commentId) {
      callback();
    };
    CommentDb.addComment(videoObjId, userObjId, comment, postedDate, onAdded);
  };

  // Delete all comments for specific video.
  var clearVideoComments = function(videoId, callback) {
    CommentDb.deleteByVideoId(videoId, function(err) {
      if (err) {
        throw err;
      }
      // Make sure likes for the video were cleared.
      CommentDb.findByVideoId(videoId, function(comments) {
        comments.length.should.equal(0);
        callback();
      });
    });
  };

  var makeComment = function(videoId, userId, postedDate) {
    return "Dummy comment " + videoId + " : " + userId + " : " + postedDate;
  };

  // Register dummy comments every before test case execution.
  beforeEach(function(done) {
    // Verify each video has been commented by all dummyUsers.
    var verifyCommentNum = function() {
      var verified = 0;
      var onFound = function(comments) {
        // Each video should be commented by all dummyUsers.
        comments.length.should.equal(dummyUserIds.length);
        verified++;
        if (verified == dummyVideoIds.length) {
          done();
        }
      };
      dummyVideoIds.forEach(function(videoId) {
        CommentDb.findByVideoId(ObjectID(videoId), onFound);
      });
    };

    // Callback when the comment is added into database.
    var added = 0;
    var onCommentAdded = function(commentId) {
      added++;
      if (added == (dummyVideoIds.length + dummyUserIds.length)) {
        verifyCommentNum();
      }
    };

    // dummyVideoIds x dummyUserIds comments will be registered.
    dummyVideoIds.forEach(function(videoId, videoIndex) {
      dummyUserIds.forEach(function(userId, userIndex) {
        var postedDate = videoIndex * 10 + userIndex;
        var dummyComment = makeComment(
          ObjectID(videoId), ObjectID(userId), postedDate);
        var comment = {
          videoId : videoId,
          userId : userId,
          comment : dummyComment,
          postedDate : postedDate
        };
        addCommentToDatabase(comment, onCommentAdded);
      });
    });
  });

  // Clear dummy like data from DB every after test case execution.
  afterEach(function(done) {
    var deleted = 0;
    var onCommentDeleted = function() {
      deleted++;
      if (dummyVideoIds.length == deleted) {
        done();
      }
    };
    dummyVideoIds.forEach(function(videoId) {
      var videoObjId = ObjectID(videoId);
      clearVideoComments(videoObjId, onCommentDeleted);
    });
  });

  // Utility method to test get method.
  function testGetMethod(api, statusCode, done, testMethod) {
    request(app).get(api).expect(statusCode).end(
      function(err, res) {
        if (err) {
          return done(err);
        }
        testMethod(err, res);
      });
  }

  // Utility method to test post method.
  function testPostMethod(api, statusCode, testMethod) {
    request(app).post(api).expect(statusCode).end(
      function(err, res) {
        testMethod(err, res);
      });
  }

  describe('/comment/find/:videoid', function() {

    it ('should return 200(OK) and comments for the video', function(done) {
      var verify = function(err, res) {
        // find should return the array of comments.
        // The number of comments should be same as number of users.
        res.body.should.have.property('comments')
                            .with.lengthOf(dummyUserIds.length);
        // Verify each comments.
        res.body.comments.forEach(function(c, index) {
          // { videoId : ObjectID of the video,
          //   userId  : ObjectID of the user,
          //   comment : What's inserted in beforeEach,
          //   postedDate : date }
          c.should.have.properties({
            comment : makeComment(c.videoid, c.userid, c.postedDate)
          });
          if (index == (dummyUserIds.length - 1)) {
            done();
          }
        });
      };
      testGetMethod(API.find(dummyVideoIds[0]), 200, done, verify);
    });

    // Memo :
    //  To execute this test case, database should be empty.
    //  Skip in daily testing.
    it.skip('should return 200(OK) and empty list if the video has no comments', function(done) {
      var verify = function(err, res) {
        // No comment should be found. Result should be empty array.
        res.body.should.have.property('comments').with.lengthOf(0);
        done();
      };
      testGetMethod(API.find('Dummy1234567'), 200, done, verify);
    });

  });

  describe('/comment/submit', function() {

    // Utility method to test post method.
    // https://github.com/visionmedia/supertest ここのattachを使って書く
    function callSubmit(videoId, userId, postedDate, comment, statusCode, done, testMethod) {
      var reqBody = {
        videoid : videoId,
        userid : userId,
        postedDate : postedDate,
        comment : comment
      };
      request(app)
      .post(API.submit())
      .send(reqBody)
      .expect(statusCode)
      .end(function(err, res) {
          if (err) {
            done(err);
          } else {
            testMethod(err, res);
          }
        });
    }

    it('should return 200(OK) and the comment id is returned', function(done) {

      // Will be assigned later.
      var videoId;
      var categoryId;

      var userId  = ObjectID('test__userid');
      var postedDate = 12345;
      var comment = 'This is test comment';
      var tagId = ObjectID('dummydummyId');

      var verify = function(err, res) {
        res.body.should.have.property('comment');

        var submittedCommentId = res.body.comment._id;
        CommentDb.findByVideoId(videoId, function(comments) {
          // The comment should be only one for the video.
          comments.length.should.equal(1);

          // Check posted comment.
          comments[0].videoid.toHexString().should.equal(videoId.toHexString());
          comments[0].userid.toHexString().should.equal(userId.toHexString());
          comments[0].comment.should.equal(comment);
          comments[0].postedDate.should.equal(postedDate);

          //Clear the added video from database.
          VideoDb.delete(videoId, function() {
            VideoCategoryDb.delete(categoryId, function() {
              done();
            });
          });
        });
      };

      var onVideoAdded = function(addedVideo) {
        videoId = addedVideo._id;
        callSubmit(videoId, userId, postedDate, comment, 200, done, verify);
      };

      // Video to comment should be there, otherwise 400 will be returned.
      VideoCategoryDb.add('dummyCategory', true, function(category) {
        categoryId = category._id;
        VideoDb.add(
          'path',
          'title',
          'thumbnail',
          userId,
          123,
          tagId,
          categoryId,
          onVideoAdded);
      });

    });

    it ('should return 400(Bad request) if the video is not found', function(done) {
      var wrongVideo = ObjectID('wrongvideoID');
      var userId  = ObjectID('test__userid');
      var postedDate = 12345;
      var comment = 'This is test comment';
      callSubmit(wrongVideo, userId, postedDate, comment, 400, done, function(err, res) {
        done();
      });
    });
  });

  describe('/comment/delete/:commentid', function() {
    it ('should return 200(OK) and the comments is deleted', function(done) {
      var targetComment;
      var verify = function(err, res) {
        // Check that the comment was deleted.
        CommentDb.findByVideoId(targetComment, function(comments) {
          comments.length.should.equal(0);
          done();
        });
      };
      CommentDb.findByVideoId(ObjectID(dummyVideoIds[0]), function(comments) {
        comments.length.should.equal(dummyUserIds.length);
        targetComment = comments[0]._id;
        testGetMethod(API.deleteById(targetComment), 200, done, verify);
      });
    });

    it ('should return 200(OK) even if the comment is not found', function(done) {
      var targetComment;
      var verify = function(err, res) {
        done();
      };
      testGetMethod(API.deleteById(ObjectID('dummycomment')), 200, done, verify);
    });
  });

  describe('/comment/deleteByUserId/:userid', function() {
    it ('should return 200(OK) and all users comments should be deleted', function(done) {
      var targetUser = ObjectID(dummyUserIds[0]);
      var verify = function(err, res) {
        // Verify the user's comment is not found in DB.
        dummyVideoIds.forEach(function(videoId, index) {
          // Search all comments for the video
          // and check there's no comment by targetUser.
          CommentDb.findByVideoId(ObjectID(videoId), function(comments) {
            for (var i=0; i<comments.length; i++) {
              if (comments[i]._id.toHexString() == targetUser.toHexString()) {
                done('A comment was not deleted');
              }
            }
            if (index == dummyVideoIds.length - 1) {
              done();
            }
          });
        });
      };
      testGetMethod(API.deleteByUserId(targetUser), 200, done, verify);
    });
  });


});
