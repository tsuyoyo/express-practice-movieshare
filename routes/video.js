/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
var fs = require('fs');
var path = require('path');
var VideoDb = require('../models/videodb.js').createClient();
var ObjectID = require('mongodb').ObjectID;
var RatingDb = require('../models/ratingdb.js').createClient();

var AWS = require('aws-sdk');
var AWS_CONFIG = __dirname + '/../.awsconfig.json';

var LOG = require('../debug/logutil').LOG;
var STORE_FOLDER = path.join(__dirname, '../public/uploads');

exports.upload = function(req, res) {

  // Remove uploaded temp file. Not to be used.
  var removeTmpFiles = function() {
    if (req.files.video) {
      fs.unlink(req.files.video.path);
    }
    if (req.files.thumbnail) {
      fs.unlink(req.files.thumbnail.path);
    }
  };

  function storeUploadedData(callback) {
    var date = new Date();
    var createdDate = date.getTime();

    var awsConfig;
    var uploadPath = 'uploadedVideo/'

    var loadAwsConfig = function(onLoaded) {

      fs.readFile(AWS_CONFIG, 'utf8', function (err, data) {
        if (err) {
          LOG.E(err);
          throw err;
        }
        awsConfig = JSON.parse(data);
        onLoaded();
      });
    };

    var makeSureStoreFolder = function() {
      try {
        fs.statSync(STORE_FOLDER);
      } catch (e) {
        LOG.E(STORE_FOLDER);
        LOG.E(e);
        fs.mkdirSync(STORE_FOLDER, 0777);
      }
    };

    var insertToDb = function() {
      var title     = req.body.title;
      var userId    = ObjectID.createFromHexString(req.body.userid);
      var thumbnail = makePublicPath(createdDate + thumbnailExtension());

      // var path      = makePublicPath(createdDate + '.mp4');
      var path = makeS3FileUrl(createdDate + '.mp4');

      var categoryId = ObjectID.createFromHexString(req.body.categoryid);

      if(req.body.tagid) {
        tagId = ObjectID.createFromHexString(req.body.tagid);
      } else {
        tagId = null;
      }

      var onAdded = function(addedVideo) {

        // Finally, store the rating to DB.
        if (req.body.rating) {

          var ratingObj = req.body.rating;

          RatingDb.add(addedVideo._id, ratingObj, function() {
            callback(addedVideo);
          });
        } else {

          callback(addedVideo);
        }
      };

      VideoDb.add(
        path,
        title,
        thumbnail,
        userId,
        createdDate,
        tagId,
        categoryId,
        onAdded);
    };

    function makeInternalFilePath(fileName) {
      return path.join(STORE_FOLDER, fileName);
    }

    function makePublicPath(fileName) {
      return path.join('/uploads', fileName);
    }

    function makeS3FileUrl(fileName) {
      return "https://s3-" + awsConfig.region + ".amazonaws.com/"
        + awsConfig.bucketName + "/" + uploadPath + fileName;
    }

    function thumbnailExtension() {
      if (thumbnail_mime === 'image/gif') {
        return '.gif';
      }
      else if (thumbnail_mime === 'image/jpeg') {
        return '.jpg';
      }
      else if (thumbnail_mime === 'image/png') {
        return '.png';
      }
      LOG.W('Unsupported type : ' + thumbnail_mime);
      return '';
    }

    // Uploadされたファイルのテンポラリのパス
    var tmp_video      = req.files.video.path;
    var tmp_thumbnail  = req.files.thumbnail.path;
    var thumbnail_mime = req.files.thumbnail.type;

    // Uploadされたファイルの置き場所
    var target_videoName     = createdDate + '.mp4';
    var target_videoPath     = makeInternalFilePath(target_videoName);
    var target_thumbnailPath = makeInternalFilePath(
      createdDate + thumbnailExtension());

    // コピー先のフォルダを確保
    makeSureStoreFolder();

    // tmp_pathからtarget_pathへファイルをコピー
    var onVideoCopied = function(err) {

      var handleError = function(e) {
        if (e) {
          LOG.E(e);
          throw e;
        }
      };
      var onThumbnailCopied = function(err) {
        handleError(err);
        insertToDb();
      };
      handleError(err);

      fs.rename(tmp_thumbnail, target_thumbnailPath, onThumbnailCopied);
    };


    var uploadFileToS3 = function(onUploaded) {

      AWS.config.update({
        accessKeyId: awsConfig.accesskey,
        secretAccessKey: awsConfig.secretkey,
        region: awsConfig.region,
      });

      var s3 = new AWS.S3();

      var params = {
        Bucket: awsConfig.bucketName,
        Key: uploadPath + target_videoName,
        Body: fs.readFileSync(target_videoPath),
        ACL: 'public-read',
      };

      s3.putObject(params, function (perr, pres) {
        onUploaded(perr);
      });
    };

    // fs.rename(tmp_video, target_videoPath, onVideoCopied);
    fs.rename(tmp_video, target_videoPath, function() {
      loadAwsConfig(function(data) {
        uploadFileToS3(onVideoCopied);
      });
    });

  }

  // Check parameters.
  if (!req.body.title || !req.body.userid ||
    !req.files.video || !req.files.thumbnail || !req.body.categoryid) {
    removeTmpFiles();
    res.send(400, { errMsg : 'There is empty field in your request' });
    return;
  }

  // Check mime type.
  var mimeType = req.files.video.type;
  if (mimeType && mimeType != 'video/mp4') {
    LOG.W('Unsupported video - mimeType : ' + mimeType);
    removeTmpFiles();
    res.send(415, { errMsg : 'Unsupported video (' + mimeType + ')' });
    return;
  }

  // Save files to public folder and register data into DB.
  storeUploadedData(function(newVideo) {
    res.send(200, { video: newVideo });
  });

};

exports.getAll = function(req, res) {
  VideoDb.findAll(function(videos) {
    res.send(200, { videos : videos });
  });
};

exports.get = function(req, res) {
  VideoDb.findById(ObjectID(req.params.videoid), function(video) {
    if (video) {
      res.send(200, { video : video });
    } else {
      res.send(404, { errMsg : 'Video is not found' });
    }
  });
};

exports.getByUserId = function(req, res) {
  VideoDb.findByUserId(ObjectID(req.params.userid), function(videos) {
    res.send(200, { videos : videos });
  });
};

exports.getByTag = function(req, res) {
  VideoDb.findByTag(ObjectID(req.params.tagid), function(videos) {
    res.send(200, { videos : videos });
  });
};

exports.getByCategory = function(req, res) {
  VideoDb.findByCategory(ObjectID(req.params.categoryid), function(videos) {
    res.send(200, { videos : videos });
  });
};

exports.deleteById = function(req, res) {
  VideoDb.delete(ObjectID(req.params.videoid), function() {
    res.send(200);
  });
};

exports.deleteByUserId = function(req, res) {
  VideoDb.deleteByUserId(ObjectID(req.params.userid), function() {
    res.send(200);
  });
};

exports.deleteByTag = function(req, res) {

};

exports.deleteByCategory = function(req, res) {

};

