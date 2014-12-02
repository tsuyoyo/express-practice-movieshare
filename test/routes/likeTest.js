/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
var should = require('should');
var request = require('supertest');
var LikeDb = require('../../models/likedb').createClient();
var ObjectID = require('mongodb').ObjectID;
var app = require('../../app');

describe('like.js', function() {

  // Common dummy data.
  var dummyVideoId = 'abcdefghtjkl';
  var dummyVideoObjId = ObjectID(dummyVideoId);
  var dummyUserIds = ['DummyUser001', 'DummyUser002', 'DummyUser003'];

  // Urls for each API.
  var API = {
    likeNum : function() {
      return '/like/numberOfLikes/' + dummyVideoId;
    },
    like : function(userId) {
      return '/like/like/' + dummyVideoId + '/' + userId;
    },
    cancelLike : function(userId) {
      return '/like/cancelLike/' + dummyVideoId + '/' + userId;
    },
    hasLike : function(userId) {
      return '/like/hasLiked/' + dummyVideoId + '/' + userId;
    }
  };

  // Add Like for dummyVideo.
  var addLikeToDatabase = function(userIds, expectTotal, callback) {
    var added = 0;
    var onAdded = function() {
      added++;
      if (userIds.length == added) {
        LikeDb.likeNum(dummyVideoObjId, function(num) {
          // Make sure the like is registered correctly.
          num.should.equal(expectTotal);
          callback();
        });
      }
    };
    for (var i=0; i < userIds.length; i++) {
      LikeDb.addLike(dummyVideoObjId, ObjectID(userIds[i]), onAdded);
    }
  };

  // Remove Like for dummyVideo.
  var clearLikeFromDatabase = function(callback) {
    LikeDb.clearLikes(dummyVideoObjId, function(num) {
      // Make sure likes for the video were cleared.
      num.should.equal(0);
      callback();
    });
  };

  // Register dummy like data every before test case execution.
  beforeEach(function(done) {
    addLikeToDatabase(dummyUserIds, dummyUserIds.length, function() {
      done();
    });
  });

  // Clear dummy like data from DB every after test case execution.
  afterEach(function(done) {
    clearLikeFromDatabase(function() {
      done();
    });
  });

  // Utility method to test get method.
  function testGetMethod(api, statusCode, testMethod) {
    request(app).get(api).expect(statusCode).end(
      function(err, res) {
        testMethod(err, res);
      });
  }

  // Verify that likes has a row which was liked by dummyUserId
  var verifyLikes = function(likes, userId, shouldFound) {
    var res = false;
    for (var i=0; i<likes.length; i++) {
      if (ObjectID(userId).toString() == likes[i].userid.toString()) {
        res = true;
        break;
      }
    }
    res.should.equal(shouldFound);
  };

  describe('/like/numberOfLikes/:videoid', function() {

    it ('should return the number of likes in DB', function(done) {
      var verify = function(err, res) {
        res.body.should.have.properties({
          likesNum : dummyUserIds.length
        });
        done();
      };
      testGetMethod(API.likeNum(), 200, verify);
    });
  });

  describe('/like/like/:videoid/:userid', function() {

    it('should increase the number of likes in DB', function(done) {
      var verify = function(err, res) {
        LikeDb.likeNum(dummyVideoObjId, function(num) {
          // dummyUserIds + 'DummyUser000' = 4 likes.
          num.should.equal(dummyUserIds.length + 1);
          done();
        });
      };
      testGetMethod(API.like('DummyUser000'), 200, verify);
    });

    it('should add a row for the user who called like', function(done) {
      var dummyUserId = 'DummyUser000';

      // Verify that dummyUser's row is in DB.
      var verify = function(err, res) {
        LikeDb.find(dummyVideoObjId, function(likes) {
          verifyLikes(likes, dummyUserId, true);
          done();
        });
      };

      LikeDb.find(dummyVideoObjId, function(likes) {
        // Before calling like, dummyUserId should not be found.
        verifyLikes(likes, dummyUserId, false);

        // After calling like, dummyUserId should be found.
        testGetMethod(API.like(dummyUserId), 200, verify);
      });
    });

    it('should return the total number of likes', function(done) {
        var verify = function(err, res) {
        res.body.should.have.properties({
          // dummyUserIds + 'DummyUser000' = 4 likes.
          likesNum : dummyUserIds.length + 1
        });
        done();
      };
      testGetMethod(API.like('DummyUser000'), 200, verify);
    });

    it ('should not increase likes when the user has alread liked', function(done) {
      var verify = function(err, res) {
        LikeDb.likeNum(dummyVideoObjId, function(num) {
          num.should.equal(dummyUserIds.length);
          done();
        });
      };
      // dummyUserIds[0] has liked in beforeEach method.
      testGetMethod(API.like(dummyUserIds[0]), 200, verify);
    });
  });

  describe('/like/cancelLike/:videoId/:userId', function() {

    it ('should decrease the number of like in DB', function(done) {
      var verify = function(err, res) {
        LikeDb.likeNum(dummyVideoObjId, function(num) {
          num.should.equal(dummyUserIds.length - 1);
          done();
        });
      };
      testGetMethod(API.cancelLike(dummyUserIds[0]), 200, verify);
    });

    it ('should remove a row of the user who called like', function(done) {
      // Verify that dummyUser's row is in DB.
      var verify = function(err, res) {
        LikeDb.find(dummyVideoObjId, function(likes) {
          verifyLikes(likes, dummyUserIds[0], false);
          done();
        });
      };

      LikeDb.find(dummyVideoObjId, function(likes) {
        // Before calling cancelLike, dummyUserId should be found.
        verifyLikes(likes, dummyUserIds[0], true);

        // After calling cancelLike, dummyUserId should not be found.
        testGetMethod(API.cancelLike(dummyUserIds[0]), 200, verify);
      });
    });

    it ('should return total number of likes', function(done) {
      var verify = function(err, res) {
        res.body.should.have.properties({
          likesNum : dummyUserIds.length - 1
        });
        done();
      };
      testGetMethod(API.cancelLike(dummyUserIds[0]), 200, verify);
    });

    it ('should not decrease likes when the user hasn\'t liked', function(done) {
      var verify = function(err, res) {
        LikeDb.likeNum(dummyVideoObjId, function(num) {
          // Shouldn't change the total number.
          num.should.equal(dummyUserIds.length);
          done();
        });
      };
      // Try to cancel like which is not posted.
      testGetMethod(API.cancelLike('DummyUser000'), 200, verify);
    });
  });

  describe('/like/hasLiked/:videoId/:userId', function() {

    it ('should return true when the user has already liked',function(done) {
      var verify = function(err, res) {
        res.body.should.have.properties({
          hasLiked : true
        });
        done();
      };
      testGetMethod(API.hasLike(dummyUserIds[0]), 200, verify);
    });

    it ('should return false when the user has not liked', function(done) {
      var verify = function(err, res) {
        res.body.should.have.properties({
          hasLiked : false
        });
        done();
      };
      // Try to cancel like which is not posted.
      testGetMethod(API.hasLike('DummyUser000'), 200, verify);
    });
  });

});
