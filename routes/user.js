/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
var LOG = require('../debug/logutil').LOG;
var UserDb = require('../models/userdb.js').createClient();
var ObjectID = require('mongodb').ObjectID;

var REGISTER_KEY = require('../constants/registerKeys').REGISTER_KEY;
var ADMIN_REGISTER_KEY = require('../constants/registerKeys').ADMIN_REGISTER_KEY;

exports.registerkey = REGISTER_KEY;

// Verify registerKey and send response if there's wrong.
function verifyRegisterKey(key, res) {
  // Check registerKey.
  if (!key || key !== REGISTER_KEY) {
    res.send(401,
      { errMsg : 'Register key was not correct'});
    return false;
  }
  return true;
}

// Verify adminRegisterKey and send response if there's wrong.
function verifyAdminRegisterKey(key, res) {
  if (key !== ADMIN_REGISTER_KEY) {
    res.send(401,
      { errMsg : 'Admin register key was not correct'});
    return false;
  }
  return true;
}

function verifyBodyFields(req, keys) {
  for(var i=0; i < keys.length; i++) {
    if (!req.body[keys[i]] || 0 === req.body[keys[i]].length) {
      return keys[i] + ' should not be empty';
    }
  }
  return null;
}

exports.register = function(req, res) {

  var err = verifyBodyFields(req, ['type', 'name', 'mail', 'team']);
  if (err) {
    res.send(400, { errMsg : err });
    return;
  }
  var name = req.body.name;
  var mail = req.body.mail;
  var team = req.body.team;
  var type = req.body.type;

  // When to register admin account
  if (req.body.type && req.body.type === 'admin') {
    if (!verifyAdminRegisterKey(req.body.adminregisterkey, res)) {
      return;
    }
  }

  var checkAlreadyRegistered = function(callback) {

    // Check name duplication
    UserDb.findByName(name, function(user) {

      if (user) {
        callback(true, name + 'is alredy registered');
        return;
      }

      // Check mail duplication
      UserDb.findByMail(mail, function(user) {
        if (user) {
          callback(true, mail + 'is alredy registered');
        } else {
          callback(false);
        }
      });
    });
  };

  checkAlreadyRegistered(function(registered, err) {

    if (registered) {

      res.send(400, { errMsg : err });
    } else {

      // Check registerKey.
      if (!verifyRegisterKey(req.body.registerkey, res)) {
        return;
      }

      // Register and return the new user ID.
      UserDb.register(name, mail, team, type, function(user) {
        res.send(200, { user : user });
      });
    }

  });

};

exports.unregister = function(req, res) {
  // Check user ID.
  if (!req.body.id || 0 === req.body.id.length) {
    res.send(400, { errMsg : 'No ID was passed'});
    return false;
  }

  // Check the name has already been registered.
  var userId = ObjectID.createFromHexString(req.body.id);
  UserDb.findById(userId, function(user) {
    if (!user) {
      res.send(400, { errMsg : 'The user is not registered'});
      return;
    }
    // Register and return the new user ID.
    UserDb.deleteById(userId, function(err) {
      if (err) {
        LOG.E(err);
      }
      res.send(200);
    });
  });
};

exports.authenticate = function(req, res) {

  var mail = req.params.mail;

  if (!mail) {
    res.send(400, { errMsg : 'Mail is required' });
    return;
  }

  var signinPass = req.params.signinPass;
  if (!signinPass || signinPass !== REGISTER_KEY) {
    res.send(400, { errMsg : 'Invalid sign-in pass' });
    return;
  }

  UserDb.findByMail(mail, function(user) {
    if (!user) {
      res.send(401, { errMsg : 'Invalid mail' });
    }
    else if (user.type === 'admin') {
      var adminKey = req.params.adminregisterkey;

      if (adminKey && adminKey === ADMIN_REGISTER_KEY) {
        res.send(200, { user : user });
      } else {
        res.send(401, { errMsg : 'Invalid admin key' });
      }
    }
    else {
      res.send(200, { user : user });
    }
  });

};

exports.getUserInfo = function(req, res) {
  var userId = ObjectID.createFromHexString(req.params.userid);
  UserDb.findById(userId, function(user) {
    if (!user) {
      res.send(400, { errMsg : 'The user is not registered'});
      return;
    }
    res.send(200, user);
  });
};

exports.getAllUsersInfo = function(req, res) {
  UserDb.findAll(function(users) {
    res.send(200, { users : users });
  });
};






