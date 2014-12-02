/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
var UserDb = require('../models/userdb').createClient();
var ObjectID = require('mongodb').ObjectID;

// markKeyName is used for a field name for mark
// keyNames = { mark : xxx, marks : yyy };
exports.Markbase = function(DbClient, keyNames) {

  var verifyUserAuthority = function(userId, callback) {
    if (!userId) {
      callback(false);
    } else {
      var userObjId = ObjectID.createFromHexString(userId);

      UserDb.findById(userObjId, function(user) {

        if (user.type === 'admin') {
          callback(true);
        } else {
          callback(false);
        }
      });
    }
  };

  var responseMarkObj = function(mark) {
    var obj = { };
    obj[keyNames.mark] = mark;

    return obj;
  };

  var responseMarkListObj = function(marks) {
    var obj = { };
    obj[keyNames.marks] = marks;

    return obj;
  };

  var getMark = function(markId, callback) {

    var response = function(code, obj) {
      return { code : code, obj : obj };
    };

    var onGot = function(mark) {

      var respondMark = function() {
        var responseObj = responseMarkObj(mark);

        callback(mark, response(200, responseObj));
      };

      // No mark was found
      if (!mark) {
        var err = { errMsg : 'Mark was not found, invalid mark id' };
        callback(null, response(400, err));
        return;
      }
      // When the mark is public, no need to check the user.
      else if (mark.public) {
        respondMark();
      }
      // When the mark is not public, only admin account has a permission to see.
      else {
        respondMark();
      }
    };

    DbClient.get(markId, onGot);
  };

  this.add = function(req, res) {

    var onAdded = function(newMark) {
      res.send(200, responseMarkObj(newMark));
    };

    if (req.body.name) {
      DbClient.add(req.body.name, req.body.ispublic, onAdded);
    } else {
      res.send(400, { errMsg : 'Mark name must not be empty'});
    }
  };

  this.get = function(req, res) {
    if (!req.params.id) {
      res.send(400, { errMsg : 'No mark id is specified for get' });
    } else {
      var markId = ObjectID.createFromHexString(req.params.id);

      getMark(markId, function(markObj, response) {
        res.send(response.code, response.obj);
      });
    }
  };

  this.getall = function(req, res) {

    var callback = function(marks) {
      res.send(200, responseMarkListObj(marks));
    };

    DbClient.getAll(callback);
  };

  this.getPublicAll = function(req, res) {

    var callback = function(marks) {
      res.send(200, responseMarkListObj(marks));
    };

    DbClient.getPublicAll(callback);
  };

  this.delete = function(req, res) {

    var id = ObjectID.createFromHexString(req.params.id);

    DbClient.get(id, function(mark) {
      // When try to delete non-existing mark
      if (!mark) {
        res.send(400, { errMsg : 'Invalid id was specified to delete'});
      } else {
        DbClient.delete(id, function() {
          res.send(200);
        });
      }
    });

  };

};






