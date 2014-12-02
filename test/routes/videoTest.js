/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
var should = require('should');
var request = require('supertest');
var VideoDb = require('../../models/videodb').createClient();
var VideoTagDb = require('../../models/videotagdb').createClient();
var RatingDb = require('../../models/ratingdb').createClient();
var VideoCategoryDb = require('../../models/videocategorydb').createClient();
var ObjectID = require('mongodb').ObjectID;
var app = require('../../app');
var fs = require('fs');
var path = require('path');

describe('video.js', function() {

  var testContents = [
    path.join(__dirname, '../testcontents/sample01.mp4'),
    path.join(__dirname, '../testcontents/sample02.mp4'),
    path.join(__dirname, '../testcontents/sample03.mp4')
  ];

  var testThumbnail = [
    path.join(__dirname, '../testcontents/thumbnail01.png'),
    path.join(__dirname, '../testcontents/thumbnail02.png'),
    path.join(__dirname, '../testcontents/thumbnail03.png')
  ];

  var dummyTag = 'DummyTag';
  var dummyCategory = 'DummyCategory';

  // Assigned in beforeEach of this block.
  var dummyCategoryId;
  var dummyTagId;

  // Urls for each API.
  var API = {
    upload : function() {
      return '/video/upload';
    },
    getAll : function() {
      return '/video/getAll';
    },
    get : function(videoId) {
      return '/video/get/' + videoId.toHexString();
    },
    getByUserId : function(userId) {
      return '/video/getByUserId/' + userId.toHexString();
    },
    getByTag : function(tagId) {
      return '/video/getByTag/' + tagId.toHexString();
    },
    getByCategory : function(categoryId) {
      return '/video/getByCategory/' + categoryId.toHexString();
    },
    delete : function(videoId) {
      return '/video/delete/' + videoId.toHexString();
    },
    deleteByUserId : function(userId) {
      return '/video/deleteByUserId/' + userId.toHexString();
    },
    deleteByTag : function(tagId) {
      return '/video/deleteByTag/' + tagId.toHexString();
    },
    deleteByCategory : function(categoryId) {
      return '/video/deleteByCategory/' + categoryId.toHexString();
    },
  };

  // VideoData =
  // { video : <filePath>,
  //   thumbnail : <filePath>,
  //   title : title,
  //   userid : userObjectId,
  //   tagid : tagObjectId,
  //   categoryid : categoryObjectId }
  function uploadVideoData(videoData, statusCode, testMethod) {
    var r = request(app).post(API.upload());
    if (videoData.video) {
      r.attach('video', videoData.video);
    }
    if (videoData.thumbnail) {
      r.attach('thumbnail', videoData.thumbnail);
    }
    if (videoData.title) {
      r.field('title', videoData.title);
    }
    if (videoData.userid) {
      r.field('userid', videoData.userid);
    }
    if (videoData.tagid) {
      r.field('tagid', videoData.tagid);
    }
    if (videoData.categoryid) {
      r.field('categoryid', videoData.categoryid);
    }
    if (videoData.rating) {
      r.field('rating', JSON.stringify(videoData.rating));
    }
    r.expect(statusCode).end(
      function(err, res) {
        testMethod(err, res);
      });
  }

  function uploadVideo(video, thumbnail, title, userid, tagid, categoryid, callback) {
    var videoData = {
        video      : video,
        thumbnail  : thumbnail,
        title      : title,
        userid     : userid,
        tagid      : tagid,
        categoryid : categoryid
    };
    uploadVideoData(videoData, 200, function(err, res) {
      res.body.should.have.property('video');
      callback(ObjectID.createFromHexString(res.body.video._id));
    });
  }

  // Utility method to test get method.
  function testGetMethod(api, statusCode, testMethod) {
    request(app).get(api).expect(statusCode).end(
      function(err, res) {
        testMethod(err, res);
      });
  }

  function deleteTestData(videoFile, thumbnailFile) {
    fs.unlink(path.join(__dirname, '../../public' + videoFile));
    fs.unlink(path.join(__dirname, '../../public' + thumbnailFile));
  }

  beforeEach(function(done) {
    var addCategory = function() {
      VideoCategoryDb.add(dummyCategory, true, function(category) {
        dummyCategoryId = category._id;
        done();
      });
    };
    var addTag = function() {
      VideoTagDb.add(dummyTag, true, function(tag) {
        dummyTagId = tag._id;
        addCategory();
      });
    };
    addTag();
  });

  afterEach(function(done) {
    var deleteCategory = function() {
      VideoCategoryDb.delete(dummyCategoryId, function() {
        done();
      });
    };
    var deleteTag = function() {
      VideoTagDb.delete(dummyTagId, function() {
        deleteCategory();
      });
    };
    deleteTag();
  });

  describe('/video/upload', function() {
    // Test dummy data.
    var dummyTitle = 'DummyTitle';
    var dummyUserId = ObjectID('dummydummyId');

    var verifyResponse = function(res, title, userId, tagId, categoryId, callback) {
      res.body.should.have.property('video');

      // Verify the video is registered in database.
      var videoId = ObjectID.createFromHexString(res.body.video._id);
      // var videoId = res.body.video._id;

      VideoDb.findById(videoId, function(video) {
        // Video should not be null.
        var res = should(video).ok;

        if (title) {
          video.title.should.equal(title);
        }

        if (userId) {
          video.userid.toString().should.equal(userId.toHexString());
        }

        if (tagId) {
          var tagIdStr = tagId.toHexString();
          video.tagid.toString().should.equal(tagIdStr);
        } else {
          video.should.not.have.property('tadid');
        }

        if (categoryId) {
          video.categoryid.toString().should.equal(categoryId.toString());
        }

        // Delete test data.
        deleteTestData(video.video, video.thumbnail);
        VideoDb.delete(videoId, function() {
          callback();
        });
      });
    };

    describe('try to add normal data', function() {

      describe('when it succeeds', function() {

        it('should return 200(OK)', function(done) {

          var videoData = {
            video      : testContents[0],
            thumbnail  : testThumbnail[0],
            title      : dummyTitle,
            userid     : dummyUserId,
            tagid      : dummyTagId,
            categoryid : dummyCategoryId
          };

          uploadVideoData(videoData, 200, function(err, res) {
            done();
          });
        });

        it('should called back with added video', function(done) {

          var videoData = {
            video      : testContents[0],
            thumbnail  : testThumbnail[0],
            title      : dummyTitle,
            userid     : dummyUserId,
            tagid      : dummyTagId,
            categoryid : dummyCategoryId
          };

          uploadVideoData(videoData, 200, function(err, res) {
            verifyResponse(res, dummyTitle, dummyUserId, dummyTagId, dummyCategoryId, done);
          });
        });

        it('should register rating object into RatingDB', function(done) {

          var videoData = {
            video      : testContents[0],
            thumbnail  : testThumbnail[0],
            title      : dummyTitle,
            userid     : dummyUserId,
            tagid      : dummyTagId,
            categoryid : dummyCategoryId,
            rating     : { ans01: "aaa", ans02: "bbb" },
          };

          uploadVideoData(videoData, 200, function(err, res) {

            var videoId = ObjectID.createFromHexString(res.body.video._id);

            RatingDb.find(videoId, function(ratingObj) {

              ratingObj.should.be.ok;
              ratingObj.should.have.property('rating');

              var rating = JSON.parse(ratingObj.rating);
              rating.should.have.property('ans01');
              rating.should.have.property('ans02');

              RatingDb.delete(ratingObj._id, function() {
                done();
              });

            });
          });
        });
      });

      it('should return 200(OK) and video ID is called back', function(done) {
        var videoData = {
          video      : testContents[0],
          thumbnail  : testThumbnail[0],
          title      : dummyTitle,
          userid     : dummyUserId,
          tagid      : dummyTagId,
          categoryid : dummyCategoryId
        };

        uploadVideoData(videoData, 200, function(err, res) {
          verifyResponse(res, dummyTitle, dummyUserId, dummyTagId, dummyCategoryId, done);
        });
      });

    });

    it('should return 415(Unsupported Media Type) when not mp4 is uploaded', function(done) {
      var invalidContent = path.join(__dirname, '../testcontents/invalidvideo.txt');
      var videoData = {
        video      : invalidContent,
        thumbnail  : testThumbnail[0],
        title      : dummyTitle,
        userid     : dummyUserId,
        tagid      : dummyTagId,
        categoryid : dummyCategoryId
      };
      uploadVideoData(videoData, 415, function(err, res) {
        res.body.should.have.property('errMsg');
        if (err) {
          done(err);
        } else {
          done();
        }
      });
    });

    it('should return 400(Bad request) when title is empty', function(done) {
      var videoData = {
        video     : testContents[0],
        thumbnail : testThumbnail[0],
        userid    : dummyUserId,
        tagid      : dummyTagId,
        categoryid : dummyCategoryId
      };
      uploadVideoData(videoData, 400, function(err, res) {
        res.body.should.have.property('errMsg');
        if (err) {
          done(err);
        } else {
          done();
        }
      });
    });

    it ('should return 400(Bad request) when thumbnail is empty', function(done) {
      var videoData = {
        video     : testContents[0],
        title     : dummyTitle,
        userid    : dummyUserId,
        tagid      : dummyTagId,
        categoryid : dummyCategoryId
      };
      uploadVideoData(videoData, 400, function(err, res) {
        res.body.should.have.property('errMsg');
        if (err) {
          done(err);
        } else {
          done();
        }
      });
    });

    it ('should return 400(Bad request) when video file is empty', function(done) {
      var videoData = {
        thumbnail : testThumbnail[0],
        title     : dummyTitle,
        userid    : dummyUserId,
        tagid      : dummyTagId,
        categoryid : dummyCategoryId
      };
      uploadVideoData(videoData, 400, function(err, res) {
        res.body.should.have.property('errMsg');
        if (err) {
          done(err);
        } else {
          done();
        }
      });
    });

    it ('should return 400(Bad request) when userId is empty', function(done) {
      var videoData = {
        video     : testContents[0],
        thumbnail : testThumbnail[0],
        title     : dummyTitle,
        tagid      : dummyTagId,
        categoryid : dummyCategoryId
      };
      uploadVideoData(videoData, 400, function(err, res) {
        res.body.should.have.property('errMsg');
        if (err) {
          done(err);
        } else {
          done();
        }
      });
    });

    it('should return 200 even if videotag is empty', function(done) {
      var videoData = {
        video     : testContents[0],
        thumbnail : testThumbnail[0],
        userid    : dummyUserId,
        title      : dummyTitle,
        categoryid : dummyCategoryId
      };
      uploadVideoData(videoData, 200, function(err, res) {
        verifyResponse(res, dummyTitle, dummyUserId, null, dummyCategoryId, done);
      });
    });

    it ('should return 400 if videocategory is empty', function(done) {
      var videoData = {
        video      : testContents[0],
        thumbnail  : testThumbnail[0],
        userid     : dummyUserId,
        title      : dummyTitle,
        tagid      : dummyTagId,
      };
      uploadVideoData(videoData, 400, function(err, res) {
        res.body.should.have.property('errMsg');
        if (err) {
          done(err);
        } else {
          done();
        }
      });
    });
  });

  describe('/video/getAll/', function() {

    it ('should return 200(OK) and all uploaded video info', function(done) {
      var videoIds = new Array(testContents.length);

      var uploadTestContents = function() {
        var uploaded = 0;

        var uploadCallback = function(id) {
          videoIds[uploaded] = id;
          uploaded++;
          if (uploaded == testContents.length) {
            onUploaded();
          }
        };

        for (var i=0; i<testContents.length; i++) {
          var title = 'DummyTitle' + i;
          var userid = ObjectID('dummyId----' + i);
          uploadVideo(testContents[i], testThumbnail[i],
            title, userid, dummyTagId, dummyCategoryId, uploadCallback);
        }
      };

      // Kick getAll when all testContents are uploaded.
      var onUploaded = function() {
        testGetMethod(API.getAll(), 200, function(err, res) {
          res.body.should.have.property('videos');

          // The length of result should be more than registered contents.
          res.body.videos.length.should.be.above(testContents.length - 1);

          // Try to delete uploaded test files and rows in DB.
          deleteTestFiles(res.body.videos);
        });
      };

      var deleteTestFiles = function(videos) {
        // id should be String.
        var isVideoIdIncluded = function(id) {
          for (var i=0; i<videoIds.length; i++) {
            if (videoIds[i].toHexString() === id) {
              return true;
            }
          }
          return false;
        };
        var deleted = 0;
        var onDeleted = function() {
          deleted++;
          if (deleted == testContents.length) {
            done();
          }
        };
        videos.forEach(function(v) {
          if (isVideoIdIncluded(v._id)) {
            // Delete test data in public folder.
            deleteTestData(v.video, v.thumbnail);

            // Delete rows for test data.
            VideoDb.delete(ObjectID(v._id), onDeleted);
          }
        });
      };

      uploadTestContents();
    });

    // Memo :
    //  To execute this test case, database should be empty.
    //  Skip in daily testing.
    it.skip ('should return 200(OK) and when no video is registered', function(done) {
      VideoDb.findAll(function(videos) {
        // No contents should be registered in database
        // when to run this test case.
        if (0 < videos.length) {
          done('No contents should be registered in database');
          return;
        }

        testGetMethod(API.getAll(), 200, function(err, res) {
          res.body.should.have.property('videos');
          res.body.videos.length.should.be.equal(0);
          done();
        });
      });
    });
  });

  describe('/video/get/:videoid', function() {

    var dummyVideoId;

    var dummyTitle = 'DummyTitle';
    var dummyUserId = ObjectID('dummydummyID');
    var dummyDate = 12345;

    beforeEach(function(done) {
      var onAdded = function(addedVideo) {
        dummyVideoId = addedVideo._id;
        done();
      };
      VideoDb.add(
        testContents[0],
        dummyTitle,
        testThumbnail[0],
        dummyUserId,
        dummyDate,
        dummyTagId,
        dummyCategoryId,
        onAdded);
    });

    afterEach(function(done) {
      var onDeleted = function() {
        VideoDb.findById(dummyVideoId, function(video) {
          var res = (!video).should.be.ok;
          done();
        });
      };
      VideoDb.delete(dummyVideoId, onDeleted);
    });

    it('should return the specific video', function(done) {
      testGetMethod(API.get(dummyVideoId), 200, function(err, res) {
        res.body.should.have.property('video');

        // Verify the returned video data.
        var video = res.body.video;
        video._id.should.equal(dummyVideoId.toHexString());
        video.title.should.equal(dummyTitle);
        video.userid.should.equal(dummyUserId.toHexString());

        done();
      });
    });

    it('should return 404(Not Found) when the video is not found', function(done) {
      var wrongVideoId = ObjectID('wrongwrongID');
      testGetMethod(API.get(wrongVideoId), 404, function(err, res) {
        res.body.should.not.have.property('video');
        res.body.should.have.property('errMsg');
        done();
      });
    });

  });

  describe('/video/getByUserId/:userid', function() {

    var dummyTitle = 'DummyTitle';
    var dummyUserId = ObjectID('dummydummyID');
    var dummyDate = 12345;

    beforeEach(function(done) {
      var added = 0;
      var onAdded = function(addedVideo) {
        added++;
        if (testContents.length == added) {
          done();
        }
      };
      testContents.forEach(function(content, index) {
        VideoDb.add(
          content,
          dummyTitle,
          testThumbnail[index],
          dummyUserId,
          dummyDate,
          dummyTagId,
          dummyCategoryId,
          onAdded);
      });
    });

    afterEach(function(done) {
      VideoDb.deleteByUserId(dummyUserId, function() {
        done();
      });
    });

    it ('should return 200(OK) and video info list uploaded by the user', function(done) {
      testGetMethod(API.getByUserId(dummyUserId), 200, function(err, res) {
        res.body.should.have.property('videos');
        res.body.videos.length.should.equal(testContents.length);
        done();
      });
    });

    it ('should return 200(OK) and empty list when the user has not uploaded yet', function(done) {
      var wrongUserId = ObjectID('wronguser_ID');
      testGetMethod(API.getByUserId(wrongUserId), 200, function(err, res) {
        res.body.should.have.property('videos');
        res.body.videos.length.should.equal(0);
        done();
      });
    });
  });

  describe('/video/getByTag/:tagid', function() {

    var dummyTitle = 'DummyTitle';
    var dummyUserId = ObjectID('dummydummyID');
    var dummyDate = 12345;

    beforeEach(function(done) {
      var added = 0;
      var onAdded = function(addedVideo) {
        added++;
        if (testContents.length == added) {
          done();
        }
      };
      testContents.forEach(function(content, index) {
        VideoDb.add(
          content,
          dummyTitle,
          testThumbnail[index],
          dummyUserId,
          dummyDate,
          dummyTagId,
          dummyCategoryId,
          onAdded);
      });
    });

    afterEach(function(done) {
      VideoDb.deleteByTag(dummyTagId, function() {
        VideoDb.findByTag(dummyTagId, function(videos) {
          if (0 === videos.length) {
            done();
          } else {
            done('Failed to delete');
          }
        });
      });
    });

    it('should return 200(OK) and tagged videos list', function(done) {

      testGetMethod(API.getByTag(dummyTagId), 200, function(err, res) {
        res.body.should.have.property('videos');
        res.body.videos.length.should.equal(testContents.length);

        var videos = res.body.videos;
        var verified = 0;
        videos.forEach(function(v) {
          v.tagid.should.equal(dummyTagId.toHexString());
          verified++;
          if (verified == videos.length) {
            done();
          }
        });
      });
    });

    it('should return 200(OK) and empty list even when the tag ID is invalid', function(done) {
      testGetMethod(API.getByTag(ObjectID('dummydummyID')), 200, function(err, res) {
        res.body.should.have.property('videos');
        res.body.videos.length.should.equal(0);
        done();
      });
    });

  });

  describe('/video/getByCategory/:categoryid', function() {

    var dummyTitle = 'DummyTitle';
    var dummyUserId = ObjectID('dummydummyID');
    var dummyDate = 12345;

    beforeEach(function(done) {
      var added = 0;
      var onAdded = function(addedVideo) {
        added++;
        if (testContents.length == added) {
          done();
        }
      };
      testContents.forEach(function(content, index) {
        VideoDb.add(
          content,
          dummyTitle,
          testThumbnail[index],
          dummyUserId,
          dummyDate,
          dummyTagId,
          dummyCategoryId,
          onAdded);
      });
    });

    afterEach(function(done) {
      VideoDb.deleteByTag(dummyTagId, function() {
        VideoDb.findByTag(dummyTagId, function(videos) {
          if (0 === videos.length) {
            done();
          } else {
            done('Failed to delete');
          }
        });
      });
    });

    it('should return 200(OK) and categorized videos list', function(done) {
      testGetMethod(API.getByCategory(dummyCategoryId), 200, function(err, res) {
        res.body.should.have.property('videos');
        res.body.videos.length.should.equal(testContents.length);

        var videos = res.body.videos;
        var verified = 0;
        videos.forEach(function(v) {
          v.categoryid.should.equal(dummyCategoryId.toHexString());
          verified++;
          if (verified == videos.length) {
            done();
          }
        });
      });
    });

    it('should return 200(OK) and empty list even when the category ID is invalid', function(done) {
      testGetMethod(API.getByCategory(ObjectID('dummydummyID')), 200, function(err, res) {
        res.body.should.have.property('videos');
        res.body.videos.length.should.equal(0);
        done();
      });
    });

  });

  describe('/video/delete/:videoid', function() {

    it ('should return 200(OK) and remove the video', function(done) {
      var onAdded = function(addedVideo) {
        var newVideoId = addedVideo._id;
        testGetMethod(API.delete(newVideoId), 200, function(err, res) {
          // Verify the video has been deleted.
          VideoDb.findById(newVideoId, function(video) {
            // TODO : res is just for JSHint error.
            var res = (!video).should.be.ok; // should be null.
            done();
          });
        });
      };
      VideoDb.add(
        testContents[0],
        'dummyTitle',
        testThumbnail[0],
        ObjectID('dummyuser-ID'),
        12345,
        dummyTagId,
        dummyCategoryId,
        onAdded);
    });

    it ('should return 200(OK) even if the video is not found', function(done) {
      var dummyVideoId = ObjectID('dummydummyID');

      // Verify the video is not registered.
      VideoDb.findById(dummyVideoId, function(video) {
        // TODO : res is just for JSHint error.
        var res = (!video).should.be.ok; // should be null.

        // Test 200 is returned by /video/delete/:videoid method.
        testGetMethod(API.delete(dummyVideoId), 200, function(err, res) {
          done();
        });
      });
    });

  });

  describe('/video/deleteByUserId/:userid', function() {

    it ('should return 200(OK) and remove all videos uploaded by the user', function(done) {
      var dummyUserId = ObjectID('dummydummyID');

      // Add dummyUser's rows.
      var addUserRows = function(callback) {
        var added = 0;
        var onAdded = function() {
          added++;
          if (testContents.length == added) {
            // Verify contents are added in database.
            VideoDb.findByUserId(dummyUserId, function(videos) {
              videos.length.should.equal(testContents.length);
              callback();
            });
          }
        };
        testContents.forEach(function(content, index) {
          VideoDb.add(
            content,
            'DummyTitle',
            testThumbnail[index],
            dummyUserId,
            12345,
            dummyTagId,
            dummyCategory,
            onAdded);
        });
      };

      // Call /video/deleteByUserId/;userid and verify rows are deleted.
      var deleteByUserId = function() {
        testGetMethod(API.deleteByUserId(dummyUserId), 200, function(err, res) {
          VideoDb.findByUserId(dummyUserId, function(videos) {
            videos.length.should.equal(0);
            done();
          });
        });
      };

      addUserRows(deleteByUserId);
    });
  });

});
